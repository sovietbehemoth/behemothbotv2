import Commands from "./commands/utility.ts";

type event_options = "message" | "typing" | "message_edit";
let prefix:string = "";

//Heartbeat object
const heartbeat_t = {
    "op": 1,
    "d": null
};

//message "namespace"
interface message {
    send: (content:string, channel:bigint, tts?:boolean) => Promise<void>;
    delete: (channel:bigint, message:bigint) => Promise<void>;
    edit: (content:string, message:bigint, channel:bigint) => Promise<void>;
    reply: (content:string, server:bigint, channel:bigint, message:bigint) => Promise<void>;
}

//typing "namespace"
interface typing {
    start: () => Promise<void>;
    stop: () => Promise<void>;
}

/**Internal callback for socket */
function on_recv(instance:any,event:any,callback:(message:any)=>any,event_t:Array<event_options>|string): void {
    const payload:any = JSON.parse(event.data.toString());
    const heartbeat:any = JSON.stringify(heartbeat_t);
    const identify:any = JSON.stringify(instance.identify_t);

    switch (payload.op) {
        case 10:    
            instance.interval = setInterval(() => {
                instance.socket.send(heartbeat);
            },41250);
            instance.socket.send(identify);
            break;
        case 0:
            if (event_t.includes("message") && payload.t === "MESSAGE_CREATE") {
                callback(payload.d);
                return;
            }
            if (payload.op === 0 && payload.t === "MESSAGE_CREATE") {
                callback(payload.d);
                return;
            }
            break;
        
        case 1:
            instance.send(heartbeat);
            break;
    }
}
//32509
class DiscordClient {
    declare private readonly socket:WebSocket;
    declare private readonly token:string;
    private hearbeat_interval:any;
    private logged_in:boolean = false;

    public identify_t = {
        "op": 2,
        "d": {
            "token": "",
            "intents": 513,
            "properties": {
                "$os": "linux",
                "$browser": "behemothlib",
                "$device": "behemothlib"
            }
        }
    };

    public message:message = {
        send: async (content:string, channel:bigint, tts=false): Promise<void> => {
            let contentf:string = content;
            if (content.length > 2000) contentf = content.substring(0, 2000);

            const url:string = `https://discord.com/api/channels/${channel.toString()}/messages`;
            await fetch(url, {
                headers: {
                    "Authorization": `Bot ${this.token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "content": contentf,
                    "tts": tts
                }),
                method: "POST"
            });
        },
        delete: async (channel:bigint, message:bigint): Promise<void> => {
        },
        edit: async (content:string, message:bigint, channel:bigint) => {
        },
        reply: async (content:string, server:bigint, channel:bigint, message:bigint) => {
        }
    }

    public typing:typing = {
        start: async () => {

        },
        stop: async () => {

        }
    }

    constructor(token:string) {
        this.socket = new WebSocket("wss://gateway.discord.gg/?v=8&encoding=json");
        this.token = token;
        this.identify_t.d.token = token;
    }

    public on(event_type:Array<event_options> | event_options, callback:(message:any, ...ext:any) => any): void {
        this.socket.onmessage = (event) => {
            on_recv(this,event,callback,event_type);
        }
    }
}

class BehemothBot {
    declare public readonly Client:DiscordClient;
    
    declare public token:string;
    declare public Permissions:any;

    public Prefix:string = "-/";

    public save_interval:any;
    public save_interval_ms:number = 180000;

    public save(): void {
        Deno.writeTextFile("./data/permissions.json", JSON.stringify(this.Permissions.toString()));

    }

    public message_callback(message:any): void {
        if (message.content.startsWith(prefix)) {
            const command:string = message.content.split(prefix)[1].trim().split(" ")[0].trim();
            switch (command) {
                case "help":
                    Commands.help(message);
                    break;
                case "curl":
                    Commands.curl(message);
                    break;
                case "perm":
                    Commands.perm(message);
                    break;
                case "save":
                    this.save();
                    break;
            }
        }
    }

    constructor() {
        prefix = this.Prefix;
        Deno.readTextFile("./data/permissions.json").then((buffer) => {
            this.Permissions = JSON.parse(buffer);
        });
        Deno.readTextFile("./botconfig.json").then((buffer) => {
            this.token = JSON.parse(buffer).bot_token;
            if (this.token === "") {
                throw new TypeError("No value for token supplied in botconfig.json file");
            }
        });
        
        this.save_interval = setInterval(() => {
            this.save();
        }, this.save_interval_ms);
        
        this.Client = new DiscordClient(this.token);
        this.Client.on("message", this.message_callback);
    }
}

const Bot:BehemothBot = new BehemothBot();

export { DiscordClient, BehemothBot, Bot };