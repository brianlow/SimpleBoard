﻿using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Web;
using SignalR.Hubs;

namespace SimpleBoard.Domain
{
    public class StoryBoardHub : Hub, IConnected
    {
        private readonly MessageStore _messageStore = new MessageStore("StoryBoard");

        public Task Connect()
        {
            return SendAllMessagesToClient();
        }

        public Task Reconnect(IEnumerable<string> groups)
        {
            return SendAllMessagesToClient();
        }

        private dynamic SendAllMessagesToClient()
        {
            return Clients[Context.ConnectionId].sendToClient(ToJsonArray(_messageStore.GetAll()));
        }

        public string SendToServer(string msg)
        {
            msg = AddAuditingInformation(msg);
            _messageStore.Add(msg);
            Clients.sendToClient(ToJsonArray(msg));
            return "";
        }

        private string AddAuditingInformation(string msg)
        {
            var user = HttpContext.Current.User.Identity.Name;
            var auditor = new Auditor(DateTime.Now, user);
            return auditor.AddAuditInformation(msg);
        }

        private string ToJsonArray(string msg)
        {
            return ToJsonArray(new[] {msg});
        }

        private string ToJsonArray(IEnumerable<string> msgs)
        {
            return "{\"Messages\":[" + string.Join(", " + Environment.NewLine, msgs) + "]}";
        }
    }
}