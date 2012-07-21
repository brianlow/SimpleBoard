using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;

namespace SimpleBoard.Storage
{
    public class MessageStore
    {
        public string Name { get; private set; }
        public string Filename { get; private set; }

        public MessageStore(string name)
        {
            Name = name;
            var appDataPath = GetAppDataFolder();
            Filename = Path.Combine(appDataPath, name + ".json");
        }

        private static string GetAppDataFolder()
        {
            if (HttpContext.Current != null)
            {
                return HttpContext.Current.Server.MapPath("~/App_Data/");
            }
            return ".";
        }

        public void Add(string msg)
        {
            File.AppendAllLines(Filename, new[] {msg.Replace(Environment.NewLine, @"#NEWLINE#")});
        }

        public IEnumerable<string> GetAll()
        {
            if (!File.Exists(Filename))
            {
                return new string[] {};
            }
            return File.ReadAllLines(Filename).Select(line => line.Replace(@"#NEWLINE#", Environment.NewLine));
        }
    }
}