from os import system
from time import sleep

import sys
import threading

def runBehemothBot() -> None:
    system("deno run --allow-all websocket.ts")

def runUserBot() -> None:
    system("python3 ./learn/bot_listener.py")

#multithread
threading._start_new_thread(runBehemothBot, ())
threading._start_new_thread(runUserBot, ())

while 1:

    err = sys.stderr.read()
    if err:
        exit()

    i = input()
    if i == "!exit":
        exit()