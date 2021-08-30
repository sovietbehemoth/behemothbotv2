import websocket
import json
import threading
import time

def send_json_request(ws, request):
    ws.send(json.dumps(request))


def receive_json_response(ws):
    response = ws.recv()
    if response:
        return json.loads(response)

def heartbeat(interval, ws):
    while 1:
        time.sleep(interval)
        heartbeat_t:dict = {
            "op": 1,
            "d": "null"
        }
        send_json_request(ws, heartbeat_t)

def main():
    #obtain correct user token for listener socket and bot owner id
    fh = open("./botconfig.json", "r")
    jsread = json.loads(fh.read())
    token = jsread["user_listener_token"]
    owner_id = jsread["bot_owner_id"]
    fh.close()

    if token == "":
        raise TypeError("No value for token supplied in botconfig.json file")

    #identification payload
    payload:dict = {
        "op": 2,
        "d": {
            "token": token,
            "properties": {
                "$os": "windows",
                "$browser": "chrome",
                "$device": "phone"
            }
        }
    }

    #read json data file
    file = open("../data/words.json", "r")
    buffer = file.read()
    file.close()
    

    js = json.loads(buffer)

    #open socket and initialize callback
    ws = websocket.WebSocket()
    ws.connect("wss://gateway.discord.gg/?v=6&encording=json")
    event = receive_json_response(ws)

    #initialize heartbeat and identify with gateway
    heartbeat_interval = event["d"]["heartbeat_interval"] / 1000
    threading._start_new_thread(heartbeat, (heartbeat_interval, ws))
    send_json_request(ws, payload)

    #keep socket open
    while 1:
        event = receive_json_response(ws)

        try:
            author = event["d"]["author"]["username"]
            content = event["d"]["content"]

            if content == "-/bot -stopl" and event["d"]["author"]["id"] == owner_id:
                ws.close()
                break

            if author not in js["names"]: js["names"].append(author)
            for i in content.split(" "):
                if i != "" and i.isalpha(): 
                    js["words"].append(i)

            file = open("../data/words.json", "w")
            file.write(json.dumps(js))



        except:
            continue


if __name__ == "__main__":
    main()