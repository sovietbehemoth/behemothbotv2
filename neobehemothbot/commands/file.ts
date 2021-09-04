import Bot from "../behemothbot.ts";

interface file_t {
    name:string,
    extension:string,
    owner:string,
    buffer:string
}

function formatBuffer(buffer:string, extension:string): string {
    if (extension === "txt") 
        return ` \`\`\`${buffer}\`\`\` `;
    else 
        return ` \`\`\`${extension}\n${buffer}\`\`\` `;
}

async function file(message:any): Promise<void> {
    const command:string[] = message.content.split(`${Bot.BotConfig.Prefix}file`)[1].split(" ");
    command.shift();

    let newfile:boolean = false;
    for (let i = 0; i < command.length; i++) {
        if (command[i] === "-new") {
            let fname:string = command[i+1];
            if (fname.includes(".")) {
                switch (fname.split(".")[1]) {
                    case "txt": break;
                    case "ts": break;
                    case "py": break;
                    case "c": break;
                    case "cpp": break;
                    case "js": break;
                    default:
                        Bot.message.send(`BehemothBotFileManager: Unsupported file extension '${fname.split(".")[1]}'`, message.channel_id);
                        break;
                }
            }

            let located:boolean = false;
            let pos:number = -1;
            for (let i2 = 0; i2 < Bot.Files.length; i2++) {
                if (Bot.Files[i2].name === command[i+1] || Bot.Files[i2].name+"."+Bot.Files[i2].extension === command[i+1]) {
                    located = true;
                    pos = i2;
                }
            }
            if (located === true) {
                Bot.message.send(`BehemothBotFileManager: File by the name of '${fname}' already exists`, message.channel_id);
                return;
            }

            Bot.Files.push({
                name: fname.split(".")[0],
                extension: fname.split(".")[1],
                owner: message.author.id,
                buffer: ""
            });
            Bot.message.send(`BehemothBotFileManager: Created file '${fname}'`, message.channel_id);
            await Deno.writeTextFile("./data/filesystem.json", JSON.stringify(Bot.Files));
        } else if (command[i] === "-read") {
            if (command[i+1] === undefined) {
                Bot.message.send(`BehemothBotFileManager: Expected fields for -read (file)`, message.channel_id);
                return;
            } 
            let located:boolean = false;
            let pos:number = -1;
            for (let i2 = 0; i2 < Bot.Files.length; i2++) {
                if (Bot.Files[i2].name === command[i+1] || Bot.Files[i2].name+"."+Bot.Files[i2].extension === command[i+1]) {
                    located = true;
                    pos = i2;
                }
            }
            if (located === true) {
                const file:any = Bot.Files[pos];
                if (command[i+2] === undefined) {
                    Bot.message.send(`BehemothBotFileManager: Expected fields for -read (outindicator & stream)`, message.channel_id);
                } if (command[i+2] == "<<") {
                    if (command[i+3] === undefined) {
                        Bot.message.send(`BehemothBotFileManager: Expected fields for -read (stream)`, message.channel_id);
                        return;
                    } else {
                        const stream:string = command[i+3].trim();
                        switch (stream) {
                            case "stdout":
                                console.log(file.buffer);
                                return;
                            case "stderr":
                                console.error(file.buffer);
                                return;
                            case "here":
                                const formatted:string = formatBuffer(file.buffer, file.extension);
                                Bot.message.send(formatted, message.channel_id);
                                return;
                        }
                    }
                } else {
                    Bot.message.send(`BehemothBotFileManager: Expected fields for -read (outindicator)`, message.channel_id);
                }
            } else {
                Bot.message.send(`BehemothBotFileManager: FileSearch: File not found '${command[i+1]}', indexed ${Bot.Files.length} files.`, message.channel_id);
            }
        } else if (command[i] === "-wpl") {
            if (command[i+1] === undefined) {
                Bot.message.send(`BehemothBotFileManager: Expected fields for -wpl (file, append)`, message.channel_id);
                return;
            } 
            let located:boolean = false;
            let pos:number = -1;
            for (let i2 = 0; i2 < Bot.Files.length; i2++) {
                if (Bot.Files[i2].name === command[i+1] || Bot.Files[i2].name+"."+Bot.Files[i2].extension === command[i+1]) {
                    located = true;
                    pos = i2;
                }
            }
            if (located === true) { 
                let buffersend:string = command.splice(i+2).join(" ");
                if (buffersend.startsWith("```") && buffersend.endsWith("```")) {
                    const fstr:string = buffersend.substring(3, buffersend.length - 3);
                    Bot.Files[pos].buffer += fstr;
                    Bot.message.send(`BehemothBotFileManager: Appended ${fstr.length} bytes`, message.channel_id);
                } else {
                    Bot.message.send(`BehemothBotFileManager: Malformed w+ syntax.`, message.channel_id);
                }
            } else {
                Bot.message.send(`BehemothBotFileManager: FileSearch: File not found '${command[i+1]}', indexed ${Bot.Files.length} files.`, message.channel_id);
            }
            await Deno.writeTextFile("./data/filesystem.json", JSON.stringify(Bot.Files));
        } else if (command[i] === "-write") {
            if (command[i+1] === undefined) {
                Bot.message.send(`BehemothBotFileManager: Expected fields for -wpl (file, append)`, message.channel_id);
                return;
            } 
            let located:boolean = false;
            let pos:number = -1;
            for (let i2 = 0; i2 < Bot.Files.length; i2++) {
                if (Bot.Files[i2].name === command[i+1] || Bot.Files[i2].name+"."+Bot.Files[i2].extension === command[i+1]) {
                    located = true;
                    pos = i2;
                }
            }
            if (located === true) { 
                let buffersend:string = command.splice(i+2).join(" ");
                if (buffersend.startsWith("```") && buffersend.endsWith("```")) {
                    const fstr:string = buffersend.substring(3, buffersend.length - 3);
                    Bot.Files[pos].buffer = fstr;
                    Bot.message.send(`BehemothBotFileManager: Wrote ${fstr.length} bytes`, message.channel_id);
                } else {
                    Bot.message.send(`BehemothBotFileManager: Malformed write syntax.`, message.channel_id);
                }
            } else {
                Bot.message.send(`BehemothBotFileManager: FileSearch: File not found '${command[i+1]}', indexed ${Bot.Files.length} files.`, message.channel_id);
            }
            await Deno.writeTextFile("./data/filesystem.json", JSON.stringify(Bot.Files));
        } else if (command[i] === "-info") {
            const perm_ls:any = Bot.ProfileDatabase;
            let permlocated:boolean = false;
            for (let i2 = 0; i2 < perm_ls.length; i2++) {
                if (perm_ls[i2].id === message.author.id) {
                    permlocated = true;
                    if (perm_ls[i2].Permissions.role === "administrator" || perm_ls[i2].Permissions.role === "developer") {
                        if (command[i+1] === "") {
                            Bot.message.send("BehemothBotFileManager: Insufficient permissions, must be (developer | administrator)", message.channel_id);
                            return;
                        }
                        let locate:boolean = false;
                        for (let i3 = 0; i3 < Bot.Files.length; i++) {
                            Bot.message.send("Here");
                            if (Bot.Files[i3].name === command[i+1] || Bot.Files[i3].name+"."+Bot.Files[i3].extension === command[i+1]) {
                                Bot.message.send(`BehemothBotFileManager: File diagnostics\n\tName: ${Bot.Files[i3].name}\n\tExtension: ${Bot.Files[i3].extension}\n\tSize: ${Bot.Files[i3].buffer.length} bytes\n\tOwner: ${Bot.Files[i3].owner}`, message.channel_id);
                                locate = true;
                            }
                        }
                        if (locate === false) {
                            Bot.message.send(`BehemothBotFileManager: FileSearch: File not found '${command[i+1]}'`, message.channel_id);
                        }
                    }
                }
            }
            if (permlocated === false) {
                Bot.message.send("BehemothBotFileManager: Insufficient permissions, must be (developer | administrator)", message.channel_id);
                return;
            }
        }
    }
}

export type { file_t };
export { file };