import { file_t } from "./commands/file.ts";
import Commands from "./commands/utility.ts"
import DiscordClient from "./debug.ts";

interface PermissionProfile {
    role:string,
    permissions:string[],
}

interface Profile {
    id:string,
    username:string,
    Permissions: PermissionProfile
}

interface FileStructure {
    name:string,
    extension:string, 
    owner:string,
    buffer:string
}

class BehemothBot extends DiscordClient {

    declare public ProfileDatabase:Array<Profile>;
    declare public Files:Array<FileStructure>;

    public BotConfig:any = {
        Prefix: "-/"
    }

    /**Extract information from JSON files. */
    private async append_information(): Promise<void> {
        const permbuf:string = await Deno.readTextFile("./data/perm.json");
        this.ProfileDatabase = JSON.parse(permbuf);
        const filebuf:string = await Deno.readTextFile("./data/filesystem.json");
        this.Files = JSON.parse(filebuf);
    } 



    private message_callback(data:any): void {
        const message:any = data.data;
        if (message.content.startsWith(Bot.BotConfig.Prefix)) {
            const command:string = message.content.split(Bot.BotConfig.Prefix)[1].trim().split(" ")[0].trim();
            switch (command) {
                case "help":
                    //Commands.help(message);
                    break;
                case "curl":
                    //Commands.curl(message);
                    break;
                case "perm":
                    Commands.perm(message);
                    break;
                case "file":
                    Commands.file(message);
                    break;
                case "eval":
                    break;
                case "sex":
                    Bot.message.send("Bot: IceAger233 you need to stop.");
                    break;
            }
        }
    }

    constructor(token:string) { 
        super(token);
        this.on("message", this.message_callback);
        this.append_information();
    }
}


const buffer:string = await Deno.readTextFile("./botconfig.json");
const token = JSON.parse(buffer).bot_token;
if (token === "") {
    console.error("No value for bot token supplied in botconfig.json file.");
    Deno.exit(1);
}
const Bot:BehemothBot = new BehemothBot(token);


export default Bot;