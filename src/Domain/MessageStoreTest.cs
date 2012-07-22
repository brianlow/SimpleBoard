using System;
using System.IO;
using FluentAssertions;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace SimpleBoard.Domain
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

        [TestMethod]
        public void ShouldGetEmptyListOfFileDoesNotExist()
        {
            if (File.Exists(_store.Filename))
            {
                File.Delete(_store.Filename);
            }
            _store.GetAll().Should().BeEmpty();
        }
    }
}