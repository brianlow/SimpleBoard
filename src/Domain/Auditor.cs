using System;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace SimpleBoard.Domain
{
    public class Auditor
    {
        private readonly DateTime _now;
        private readonly string _user;

        public Auditor(DateTime now, string user)
        {
            _now = now;
            _user = user;
        }

        public string AddAuditInformation(string msg)
        {
            dynamic json = JObject.Parse(msg);
            json.DateTime = _now;
            json.User = _user;
            return JsonConvert.SerializeObject(json).Replace(Environment.NewLine, "");
        }
    }
}