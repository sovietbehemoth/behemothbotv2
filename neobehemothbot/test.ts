import DiscordClient from "./commands/discord.d.ts";

DiscordClient.prototype.constructor = (Token:string, options?:any) => {
    console.log("D");
}

const nthis = new DiscordClient("D");