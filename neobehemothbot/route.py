from os import system

import json
import sys
import threading
import time

bot = {
    "user_bot_scanner": True
}

def determineCond() -> None:
    file = open("./botconfig.json", "r")
    js = json.loads(file.read())
    bot["user_bot_scanner"] = js["run_user_bot"]


def runBehemothBot() -> None:
    system("deno run --allow-all behemothbot.ts")

def runUserBot() -> None:
    if bot["user_bot_scanner"] == True:
        system("python3 ./learn/bot_listener.py")

#multithread
threading._start_new_thread(runBehemothBot, ())
threading._start_new_thread(runUserBot, ())

while 1:
    i = input()
    if i == "!exit":
        exit()