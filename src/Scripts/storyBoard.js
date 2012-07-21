
var processedMessages = { };

//
// Parse and process messages received from the server
//

function processMessages(msgs, body) {
    $.each(msgs.Messages, function (index, msg) {

        if (processedMessages[msg.MessageId] === true)
            return;

        if (msg.MessageType === "AddNewList") {

            var divForNewList = "<div class='list'><div class='listHeader'>" + msg.Name + "</div><ul data-id='" + msg.ListId + "'></ul><div class='addNewStory'>Add new story...</div></div>";
            body.append(divForNewList);

        } else if (msg.MessageType === "AddNewStory") {

            var liForNewStory = $("<li data-id='" + msg.StoryId + "' data-position='" + msg.Position + "' class='story'><div>" + msg.Name + "</div></li>");

            var ul = body.find(".list ul[data-id='" + msg.ListId + "']");
            var li = findFirstLiWithPositionAfter(ul, parseFloat(msg.Position));
            if (li === null) {
                ul.append(liForNewStory);
            } else {
                li.before(liForNewStory);
            }

        } else if (msg.MessageType === "ChangeStoryName") {

            var divInsideLiForStory = body.find("li[data-id='" + msg.StoryId + "'] div")[0];
            $(divInsideLiForStory).text(msg.Name);

        } else if (msg.MessageType == "RemoveStory") {

            var liForStory = body.find("li[data-id='" + msg.StoryId + "']")[0];
            $(liForStory).remove();

        }

        processedMessages[msg.MessageId] = true;
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

function createChangeOrRemoveStoryMessage(li, newStoryName) {
    var storyId = $(li).attr("data-id");

    if (newStoryName === "" || newStoryName === null) {
        var removeStoryMessage = {
            MessageId: newGuid(),
            MessageType: "RemoveStory",
            StoryId: storyId
        };
        return removeStoryMessage;
    }
    
    var changeStoryNameMessage = {
        MessageId: newGuid(),
        MessageType: "ChangeStoryName",
        StoryId: storyId,
        Name: newStoryName
    };
    return changeStoryNameMessage;
}