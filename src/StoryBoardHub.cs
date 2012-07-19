using SignalR.Hubs;

namespace SimpleBoard
{
    public class StoryBoardHub : Hub
    {
        public string SendToServer(string msg)
        {
            Clients.sendToClient("Hello");
            return "";
        }
    }
}