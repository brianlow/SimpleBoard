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
            return Clients.sendToClient(ToJsonArray(_messageStore.GetAll()));
        }

        private string ToJsonArray(IEnumerable<string> msgs)
        {
            return "{\"Messages\":[" + string.Join(", " + Environment.NewLine, msgs) + "]}";
        }

        public string SendToServer(string msg)
        {
            _messageStore.Add(msg);
            return "";
        }

        public Task Reconnect(IEnumerable<string> groups)
        {
            return null;
        }
    }
}