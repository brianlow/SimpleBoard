
//
// Parse and process messages received from the server
//
function processMessages(msgsAsString, body) {
    var msgs = JSON.parse(msgsAsString);
    $.each(msgs.Messages, function (index, msg) {

        if (msg.MessageType === "AddNewList") {
            
            var divForNewList = "<div class='list'><div class='listHeader'>" + msg.Name + "</div><ul data-id='" + msg.ListId + "'></ul><div class='addNewStory'>Add new story...</div></div>";
            body.append(divForNewList);
            
        }
        else if (msg.MessageType === "AddNewStory") {

            var liForNewStory = $("<li data-id='" + msg.StoryId + "' data-position='" + msg.Position + "' class='story'><div>" + msg.Name + "</div></li>");

            var ul = body.find(".list ul[data-id='" + msg.ListId + "']");
            var li = findFirstLiWithPositionAfter(ul, parseFloat(msg.Position));
            if (li === null) {
                ul.append(liForNewStory);
            } else {
                li.before(liForNewStory);
            }
        }
    });
}

function findFirstLiWithPositionAfter(ul, targetPosition) {
    var children = ul.children("li");
    for (var i = 0; i < children.length; i++) {
        var liPosition = parseFloat($(children[i]).attr("data-position"));
        if (liPosition > targetPosition) {
            return $(children[i]);
        }
    }
    return null;
}

function createAddNewStoryMessage(ul, newStoryName) {
    var newPosition = 0;
    var lastLi = ul.children("li").last();
    if (lastLi.length === 1) {
        newPosition = parseFloat(lastLi.attr("data-position")) + 10;
    }
    ul.append($("<li data-id='99' data-position='" + newPosition + "' class='story'><div>" + newStoryName + "</div></li>"));
    var addNewStoryMessage = {
        MessageId: newGuid(),
        MessageType: "AddNewStory",
        StoryId: newGuid(),
        Name: newStoryName,
        ListId: ul.attr("data-id"),
        Position: newPosition
    };
    return addNewStoryMessage;
}

function createChangeStoryNameMessage(li, newStoryName) {
    var storyId = $(li).attr("data-id");
    var changeStoryNameMessage = {
        MessageId: newGuid(),
        MessageType: "ChangeStoryName",
        StoryId: storyId,
        Name: newStoryName
    };
    return changeStoryNameMessage;

}