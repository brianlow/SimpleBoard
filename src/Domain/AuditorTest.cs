using System;
using FluentAssertions;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace SimpleBoard.Domain
{
    [TestClass]
    public class AuditorTest
    {
        [TestMethod]
        public void ShouldAddAuditInformationToJsonMessage()
        {
            var msg = "{\"MessageId\":\"9721b397-e281-40ff-b0de-7cf2aea6776e\"," +
                      "\"MessageType\":\"ChangeStoryName\"," +
                      "\"StoryId\":\"0788c7bb-be8a-4722-ba5c-c62029d395b8\"," +
                      "\"Name\":\"Create Customer\"}";
            var now = new DateTime(2012, 1, 2, 3, 4, 5);

            var msgWithAudit = new Auditor(now, @"domain\brian_low").AddAuditInformation(msg);

            msgWithAudit.Should().Be(
                "{\"MessageId\":\"9721b397-e281-40ff-b0de-7cf2aea6776e\"," +
                "\"MessageType\":\"ChangeStoryName\"," +
                "\"StoryId\":\"0788c7bb-be8a-4722-ba5c-c62029d395b8\"," +
                "\"Name\":\"Create Customer\"," +
                "\"DateTime\":\"2012-01-02T03:04:05\"," +
                "\"User\":\"domain\\\\brian_low\"}");
        }
    }
}