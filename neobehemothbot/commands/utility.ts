import { BehemothBot, Bot } from "../websocket.ts";

import { curl } from "../network/net.ts";
import { file } from "./file.ts";

async function help(message:any): Promise<void> {
    const command:string[] = message.content.split(`${Bot.Prefix}help`)[1].split(" ");
    command.shift();

    if (command.length === 0) {
        Bot.Client.message.send(`
        BehemothBot is a multi-purpose utility bot that is capable of performing many tasks
        `, message.channel_id);
        return;
    }

    for (let i = 0; i < command.length; i++) {
        if (command[i] == "-c") {

        }
    }
}

async function permissions(message:any): Promise<void> {
    const command:string[] = message.content.split(`${Bot.Prefix}perm`)[1].split(" ");
    const json:any = Bot.Permissions;
    command.shift();

    if (command.length === 0) {
        Bot.Client.message.send(`Error: No arguments provided`, message.channel_id);
    }

    for (let i = 0; i < command.length; i++) {
        if (command[i] === "-q" && command[i+1] === "@me") {
            for (let i2 = 0; i2 < json.length; i2++) {
                if (json[i2].id === message.author.id) {
                    Bot.Client.message.send(`BehemothBotDiscordManager: Reading ${message.author.id} permissions \n\tRole: ${json[i2].role}\n\tPermissions: ${json[i2].permissions.toString()}`, message.channel_id);
                    return;
                }
            }
            Bot.Client.message.send(`BehemothBotDiscordManager: Reading ${message.author.id} permissions\n\tRole: default`, message.channel_id);
        } else if (command[i] === "-q") {
            if (command[i+1] === "") {
                Bot.Client.message.send(`BehemothBotDiscordManager: -q option expects userid`, message.channel_id);
                return;
            }
            for (let i2 = 0; i2 < json.length; i2++) {
                if (json[i2].id === command[i+1]) {
                    Bot.Client.message.send(`BehemothBotDiscordManager: Reading ${command[i+1]} permissions \n\tRole: ${json[i2].role}\n\tPermissions: ${json[i2].permissions.toString()}`, message.channel_id);
                    return;
                }
            }
            Bot.Client.message.send(`BehemothBotDiscordManager: Reading ${command[i+1]} permissions\n\tRole: default or nonexistent`, message.channel_id);
        } else if (command[i] === "-add") {
            let exists:boolean = false;
            let num:number = 0;
            for (let i2 = 0; i2 < json.length; i2++) {
                if (json[i2].id === command[i+1]) {
                    exists = true;
                    num = i2;
                }
            }

            let role:string = "";
            let perms:string[] = [];
            switch (command[i+2]) {
                case "=developer": role = "developer"; break;
                case "=administrator": role = "administrator"; break;
                case "=operator": role = "operator"; break;
                case "network": perms.push("network"); break;
                case "shell": perms.push("shell"); break;
            }

            if (role === "") role = "default";

            if (exists) {
                for (let i2 = 0; i2 < perms.length; i2++) {
                    if (!json[num].permissions.includes(perms[i2])) json[num].permissions.push(perms[i2]);
                }
            } else {
                json.push({
                    "id": command[i+1],
                    "role": role,
                    "permissions": perms
                });
            }

            Deno.writeTextFile("./data/permissions.json", JSON.stringify(Bot.Permissions));
        }
    }

}

interface _Commands {
    help: (message:any) => Promise<void>;
    curl: (message:any) => Promise<void>;
    perm: (message:any) => Promise<void>;
    file: (message:any) => Promise<void>;
}

const Commands:_Commands = {
    help: async (message:any): Promise<void> => {
        await help(message);
    },
    curl: async (message:any): Promise<void> => {
        await curl(message);
    },
    perm: async (message:any): Promise<void> => {
        await permissions(message);
    },
    file: async (message:any): Promise<void> => {
        await file(message);
    }
}

export default Commands;