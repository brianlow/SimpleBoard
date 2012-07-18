using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace SimpleBoard.Storage
{
    public class MessageStore
    {
        public string Name { get; private set; }
        public string Filename { get; private set; }

        public MessageStore(string name)
        {
            Name = name;
            Filename = Path.Combine(".", name + ".json");
        }

        public void Add(string msg)
        {
            File.AppendAllLines(Filename, new[] {msg.Replace(Environment.NewLine, @"#NEWLINE#")});
        }

        public IEnumerable<string> GetAll()
        {
            return File.ReadAllLines(Filename).Select(line => line.Replace(@"#NEWLINE#", Environment.NewLine));
        }
    }
}