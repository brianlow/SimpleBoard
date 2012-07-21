using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SignalR.Hubs;
using SimpleBoard.Storage;

namespace SimpleBoard
{
    public class StoryBoardHub : Hub, IConnected
    {
        private readonly MessageStore _messageStore = new MessageStore("StoryBoard");

        public Task Connect()
        {
            return Clients[Context.ConnectionId].sendToClient(ToJsonArray(_messageStore.GetAll()));
        }

        public string SendToServer(string msg)
        {
            _messageStore.Add(msg);
            Clients.sendToClient(ToJsonArray(msg));
            return "";
        }

        private string ToJsonArray(string msg)
        {
            return ToJsonArray(new[] {msg});
        }

        private string ToJsonArray(IEnumerable<string> msgs)
        {
            return "{\"Messages\":[" + string.Join(", " + Environment.NewLine, msgs) + "]}";
        }

        public Task Reconnect(IEnumerable<string> groups)
        {
            return null;
        }
    }
}