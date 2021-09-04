
type intent = "message" | "typing" | "guild_join" | "ready";
type presence_types = "idle" | "dnd" | "invisible" | "offline" | "online";

interface bot_init_options {
    "$os"?: string,
    "$device"?: string,
    "$browser"?: string
}

interface public_bot_config {
    /**Whether bot messages are acknowledged. */
    BlockBots: boolean,
    ExitOnHTTPError: boolean
}

interface identify_payload {
    "op": 2,
    "d": {
        "token": string,
        "intents": 32509,
        "properties": bot_init_options
    }
}

interface base_payload {
    event: string,
    data: any
}

interface Users {
    Name: string,
    Level: number,
    NumberOfMessages: number,
    Id: string
}

interface presence {
    update: (status_t:presence_types) => Promise<void>;
    go_afk: () => Promise<void>;
}

interface reaction {
    /**
    * Create a reaction on a message. 
    * @param emoji Emoji to react with, must be URL-encoded, custom emojis can be provided with this 
    * syntax: name:id with name being the emoji name and id being the emoji id.
    * @param message ID of the message to react to.
    * @param channel ID of the channel containing message.
    */
    create: (emoji:string, message?:string, channel?:string) => Promise<void>;

    /**
     * Deletes a reaction on a message.
     * @param user When toggled to 'self' client will attempt to delete it's own reaction to the message, otherwise
     * the parameter should be set to the user ID of the creator of the reaction to delete.
     * @param emoji Target emoji to delete. Must be URL-encoded, custom emojis can be provided with this 
     * syntax: name:id with name being the emoji name and id being the emoji id.
     * @param channel Channel containing the message.
     * @param message Message ID of the message.
     */
    delete: (user:"self"|string, emoji:string, channel?:string, message?:string) => Promise<void>;

}

//message "namespace"
interface message {
    /**
     * Send messages as the bot.
     * @param content Content of the message to send.
     * @param channel Channel ID of the channel to send the message, if left blank message will be sent to the binded channel.
     * @param tts Enable or disable text-to-speech.
     */
    send: (content:string, channel?:string, tts?:boolean) => Promise<void>;

    /**
     * Deletes messages. Must have proper server permissions.
     * @param channel Channel ID of the channel where the message is located.
     * @param message Message ID of the message.
     */
    delete: (message?:string, channel?:string) => Promise<void>;

    /**
     * Edits a message. Must be a message sent by the bot.
     * @param content New content for the message being edited.
     * @param message Message ID of the message to be edited.
     * @param channel Channel ID of the channel containing the message.
     */
    edit: (content:string, message:string, channel?:string) => Promise<void>;

    /**
     * Reply to a message.
     * @param content Content of message to send.
     * @param message ID of message to reply to.
     * @param server ID of server containing message.
     * @param channel ID of channel containing message.
     * @param tts Whether the message is text-to-speech.
     */
    reply: (content:string, message?:string, server?:string, channel?:string, tts?:boolean) => Promise<void>;

    reaction:reaction
}

//typing "namespace"
interface typing {
    /**
     * Trigger typing event. Bot will appear as typing on discord.
     */
    start: (channel?:string) => Promise<void>;
}


class DiscordClient {
    /**The WebSocket instance used by the client.*/
    declare private Socket:WebSocket;

    /**ID assigned to the client.*/
    declare private SessionID:string;

    /**The Bot token provided for requests made through the Discord API for authorization.*/
    declare private readonly Token:string;

    /**The client's ID, used for increased interactivity. */
    declare private readonly BotID:string;

    /**The payload that will be sent through the WebSocket to the Discord gateway.*/
    declare private readonly Identify_Structure:identify_payload;

    /**The HTTP headers used for interacting with the Discord API. */
    declare private readonly HTTP_Header:any;

    /**Interval object sending heartbeats to the gateway.*/
    declare private HeartbeatInterval:any;

    /**Encapsulated meta configurations.*/
    private botconfig:any = {
        leveltracking: false,
        leveltrackinginterval: undefined
    }

    public Config:public_bot_config = {
        BlockBots: false,
        ExitOnHTTPError: false
    }

    /**Event callback. */
    private Callback: (data:base_payload, ...ext:any) => any = (d) => {};

    /**The number of events received.*/
    private Sequences:number|null = null;





    /**List of data to be received by client.*/
    declare protected Intents:intent | Array<intent>;

    /** Discord channel in which the Client is binded to. The client will send messages here 
     * when channel parameters are not provided.  */
    declare private Channel:string;

    /** Discord server in which the client is binded to. The client send messages here 
     * when server parameters are not provided.*/
    declare private Server:string;

    /** Current message context. When message is received, the ID is stored here until another 
     * is received. The ID will be used if no message ID is provided.*/
    declare private Message:string;

    /**
     * Object which contains data regarding the level tracking system in the library.
     * @property MSGsToLevelUp Number of messages it takes to level up.
     * @property DataFile JSON file to save the level data to.
     * @property AutoSaveTimeSeconds Interval in which the level data will be written to the JSON data file.
     * @property SendLevelUpMessages Whether to send messages announcing that a certain user has gained a level.
     * @property Levels Array of data regarding users.
     */
    public LevelTracking: {
        MSGsToLevelUp:number,
        DataFile:string,
        AutoSaveTimeSeconds:number,
        SendLevelUpMessages:boolean,
        Levels: Users[]
    } = {
        MSGsToLevelUp: 50,
        DataFile: "levels.json",
        AutoSaveTimeSeconds: 30,
        SendLevelUpMessages: true,
        Levels: []
    }
    




    /**Level up callback function used to track levels.*/
    private async levelUp(message:any): Promise<void> {
        let located:boolean = false;
        let loc:number = -1;
        for (let i = 0; i < this.LevelTracking.Levels.length; i++) {
          if (message.author.id === this.LevelTracking.Levels[i].Id) {
            located = true;
            loc = i;
          }
        } if (located === false) {
          this.LevelTracking.Levels.push({
            Name: message.author.username,
            Level: 0,
            Id: message.author.id,
            NumberOfMessages: 1
          });
          loc = this.LevelTracking.Levels.length-1;
        } else {
          this.LevelTracking.Levels[loc].NumberOfMessages++;
        }
    
        if (this.LevelTracking.Levels[loc].NumberOfMessages % this.LevelTracking.MSGsToLevelUp === 0) {
          this.LevelTracking.Levels[loc];
          this.LevelTracking.Levels[loc].Level++;
          if (this.LevelTracking.SendLevelUpMessages === true) 
            await this.message.send(`
            LevelUp: ${this.LevelTracking.Levels[loc].Name} has levelled up to level ${this.LevelTracking.Levels[loc].Level} with ${this.LevelTracking.Levels[loc].NumberOfMessages} messages
            `);
        }
    }

    /**Enables tracking of levels by users gaining points by sending messages. */
    public enableLevelTracking(): void {
        this.botconfig.leveltracking = true;
        try {
            Deno.readTextFile(this.LevelTracking.DataFile).then((buffer) => {
               try {
                    this.LevelTracking.Levels = JSON.parse(buffer).Levels;
               } catch {
                   //pass
               }
            });
        } catch {}
        this.botconfig.leveltrackinginterval = setInterval(async() => {
            try {
                await Deno.writeTextFile(this.LevelTracking.DataFile, JSON.stringify(this.LevelTracking.Levels));
            } catch (error) {
                console.log("Unable to save levels, invalid file?");
            }
        }, this.LevelTracking.AutoSaveTimeSeconds)
    }

    /**Reset all levels. */
    public async resetLevels(): Promise<void> {
        for (let i = 0; i < this.LevelTracking.Levels.length; i++) {
            const member:Users = this.LevelTracking.Levels[i];
            member.Level = 0;
            member.NumberOfMessages = 0;
        }
        try {
            await Deno.writeTextFile(this.LevelTracking.DataFile, JSON.stringify(this.LevelTracking));
        } catch {
            console.log("Unable to save levels, invalid file");
        }
    }




    private HTTPErrors(error:any): void {
        if (error !== "" && this.Config.ExitOnHTTPError === true) {
            const error_fmt:any = JSON.parse(error);
            throw new TypeError(`${error_fmt.message} (${error_fmt.code})`);
        }
    }

    /**Region containing functions pertaining to Discord messages. */
    public message:message = {
        send: async (content:string, channel:string = this.Channel, tts:boolean=false): Promise<void> => {
            let contentf:string = content;
            if (content.length > 2000) contentf = content.substring(0, 2000);
            const url:string = `https://discord.com/api/channels/${channel}/messages`;
            await fetch(url, {
                headers: this.HTTP_Header,
                body: JSON.stringify({
                    "content": contentf,
                    "tts": tts
                }),
                method: "POST"
            }).then(async (rs) => {
                this.HTTPErrors(await rs.text());
            });
        },
        delete: async (message:string = this.Message, channel:string = this.Channel): Promise<void> => {
            const url:string = `https://discord.com/api/channels/${channel}/messages/${message}`;
            await fetch(url, {
                headers: this.HTTP_Header,
                method: "DELETE"
            }).then(async (rs) => {
                this.HTTPErrors(await rs.text());
            });
        },
        edit: async (content:string, message:string, channel:string = this.Channel) => {
            const url:string = `https://discord.com/api/channels/${channel}/messages/${message}`;
            await fetch(url, {
                headers: this.HTTP_Header,
                method: "PATCH",
                body: JSON.stringify({
                    "content": content
                })
            }).then(async (rs) => {
                this.HTTPErrors(await rs.text());
            });
        },
        reply: async (content:string, message:string = this.Message, server:string = this.Server, channel:string = this.Channel, tts:boolean = false) => {
            const url:string = `https://discord.com/api/channels/${channel}/messages`;
            await fetch(url, {
                headers: this.HTTP_Header,
                method: "POST",
                body: JSON.stringify({
                    "content": content,
                    "tts": tts,
                    "message_reference": {
                        "message_id": message,
                        "channel_id": channel,
                        "guild_id": server
                    }
                })
            }).then(async (rs) => {
                this.HTTPErrors(await rs.text());
            });
        },
        reaction: {
            create: async (emoji:string, message:string = this.Message, channel:string = this.Channel): Promise<void> => {
                const url:string = `https://discord.com/api/channels/${channel}/messages/${message}/reactions/${emoji}/@me`;
                await fetch(url, {
                    method: "PUT",
                    headers: this.HTTP_Header
                }).then(async (rs) => {
                    this.HTTPErrors(await rs.text());
                });
            },

            delete: async (user:"self"|string, emoji:string, channel:string = this.Channel, message:string = this.Message): Promise<void> => {
                let url:string;
                user === "self" ? url = `https://discord.com/api/channels/${channel}/messages/${this.Message}/reactions/${emoji}/@me` : url = `https://discord.com/api/channels/${channel}/messages/${message}/reactions/${emoji}/${user}`;
                await fetch(url, {
                    method: "DELETE",
                    headers: this.HTTP_Header
                }).then(async (rs) => {
                    this.HTTPErrors(await rs.text());
                });
            }
        }
    }

    /**Region containing functions regarding the TriggerTyping event. */
    public typing:typing = {
        start: async (channel:string = this.Channel) => {
            const url:string = `https://discord.com/api/channels/${channel}/typing`;
            await fetch(url, {
                headers: this.HTTP_Header,
                method: "POST"
            });
        }
    }



    /**
     * Initializer for the DiscordClient. 
     * @param Token Authorization used by the client to interact with the Discord API. Token is obtained by creating an application in the Discord Developer Portal.
     * @param options Extra options for providing custom properties to the gateway identification structure.
     */
    constructor(Token:string, bot:boolean = true, options:bot_init_options = {"$os": "linux", "$browser": "behemothlib", "$device": "behemothlib"}) {
        let authorization:string;
        bot === true ? authorization = `Bot ${Token}` : authorization = Token;    
        this.Socket = new WebSocket("wss://gateway.discord.gg/?v=9&encoding=json");
        this.Token = Token;
        this.Identify_Structure = {
            "op": 2,
            "d": {
                "token": Token,
                "intents": 32509,
                "properties": options
            }
        };
        this.HTTP_Header = {
            "Authorization": authorization,
            "Content-Type": "application/json"
        };
        this.Token = Token;
        this.Socket.onmessage = (event) => {
            //on_recv(this,event,callback,event_type);
            this.InternalCallback(event, "message", this.Callback);
        }
        this.Socket.onclose = (event) => {
            this.ErrorHandler(event.code);
        }
    }

    private InternalCallback(event:any, events:Array<intent>|intent, callback:(data:base_payload, ...ext:any)=>any) {
        const payload:any = JSON.parse(event.data.toString());
        const heartbeat:any = JSON.stringify({
            "op": 1,
            "d": this.Sequences
        });
        const identify:any = JSON.stringify(this.Identify_Structure);
    
        this.Sequences = payload.s;
    
        switch (payload.op) {
            case 10:  
                this.HeartbeatInterval = setInterval(() => {
                    this.Socket.send(heartbeat);
                },payload.d.heartbeat_interval);
                this.Socket.send(identify);
                break;
            case 0:
                switch (payload.t) {
                    case "MESSAGE_CREATE":
                        if (payload.d.author.bot === true) return;
                        if (this.botconfig.leveltracking === true) {
                            this.levelUp(payload.d);
                        }
                        if (events.includes("message")) {
                            //Create context
                            this.Channel = payload.d.channel_id;
                            this.Message = payload.d.id;
                            this.Server = payload.d.guild_id;
                            callback({event: payload.t, data: payload.d});
                            return;
                        } else if (events.includes("message")) {
                            this.Channel = payload.d.channel_id;
                            callback({event: payload.t, data: payload.d});
                            return;
                        }
                        break;
                    case "READY":
                        this.SessionID = payload.d.session_id;
                        break;
                }
                
                break;
            
            case 1:
                this.Socket.send(heartbeat);
                break;
            case 9:
                if (payload.d === false) this.unconditional_restart();
                else this.restart();
                break;
            case 7:
                this.restart();
                break;
        }
    }

    /**Handle errors provided by the gateway. */
    private ErrorHandler(code:number): void {

        switch (code) {
            case 4000: this.restart(); break;
            case 4001: this.restart(); break;
            case 4002: this.restart(); break;
            case 4007: this.restart(); break;
            case 4009: this.restart(); break;

            case 4004:
                throw new Error("Invalid token provided.");
                break;
                
            case 4005:
                throw new Error("Bot already authenticated with client.")
                break;

            case 4008:
                console.log("You are being rate limited.");
                this.restart();
                break;
            
        }
    }

    public intern(pyld:any): void {
        this.Socket.send(JSON.stringify(pyld));
    }

    /**
     * Function to start receving data from Discord. 
     * @param event_type Intents, describes the data that the Client will forward to the callback function. Arrays are provided when more than one intent are requested.
     * @param callback Callback will be called when the Client received information. The structure will include property member 'event' which is a string that is the name of the event. Contained within the 'data' property is the actual data received by the client.
     */
    public async on(event_type:Array<intent> | intent, callback:(data:base_payload, ...ext:any) => any): Promise<void> {
        if (typeof event_type === "object" && event_type.length === 0) 
            throw new TypeError("Expected event intents, not an empty array.");
        this.Callback = callback;
        this.Intents = event_type;
    }


    /**Terminate the client.*/
    public stop(): void {
        this.Socket.close();
    }

    /**Safely restart the client. */
    public async restart(): Promise<void> {
        this.Socket.close();
        this.Socket = new WebSocket("wss://gateway.discord.gg/?v=9&encoding=json");
        this.Socket.onmessage = (data) => {
           this.InternalCallback(data, this.Intents, this.Callback);
        }
        this.Socket.onopen = () => {
            this.Socket.send(JSON.stringify({
                "op": 6,
                "d": {
                    "token": this.Token,
                    "session_id": this.SessionID,
                    "seq": this.Sequences
                }
            }));
        }
    }

    /**Completely restart the client without resuming. */
    public async unconditional_restart(): Promise<void> {
        this.Socket.close();
        this.Socket = new WebSocket("wss://gateway.discord.gg/?v=9&encoding=json");
        this.Socket.onmessage = (data) => {
           this.InternalCallback(data, this.Intents, this.Callback);
        }
    }
}

export default DiscordClient;
