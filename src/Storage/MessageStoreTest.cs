using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using FluentAssertions;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace SimpleBoard.Storage
{
    [TestClass]
    public class MessageStoreTest
    {
        private MessageStore _store;

        [TestInitialize]
        public void TestInitialize()
        {
            _store = new MessageStore("UnitTestStore");
            
        }

        [TestCleanup]
        public void TestCleanup()
        {
            if (File.Exists(_store.Filename))
            {
                File.Delete(_store.Filename);
            }
        }

        [TestMethod]
        public void ShouldAddAndGetMessages()
        {
            _store.Add("winter");
            _store.Add("is");
            _store.Add("coming");

            _store.GetAll().Should().Equal(new[] {"winter", "is", "coming"});
        }

        [TestMethod]
        public void ShouldAddAndGetMessageWhenEmbeddedNewlines()
        {
            _store.Add("hello" + Environment.NewLine + "world");
            _store.Add("who's on " + Environment.NewLine + " first?");

            _store.GetAll().Should().Equal(new[]
                                               {
                                                   "hello" + Environment.NewLine + "world",
                                                   "who's on " + Environment.NewLine + " first?"
                                               });

        }
    }
}