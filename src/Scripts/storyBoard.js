
var processedMessages = { };

//
// Parse and process messages received from the server
//

function processMessages(msgs, body) {
    $.each(msgs, function (index, msg) {

        if (processedMessages[msg.MessageId] === true)
            return;

        if (msg.MessageType === "AddNewList") {

            var divForNewList = "<div class='list'><div class='listHeader'>" + msg.Name + "</div><ul data-id='" + msg.ListId + "'></ul><div class='addNewStory'>Add new story...</div></div>";
            body.append(divForNewList);

        } else if (msg.MessageType === "AddNewStory") {

            var blockedClass = isBlocked(msg.Name) ? " blocked" : "";
            var bugClass = isBug(msg.Name) ? " bug" : "";
            var liForNewStory = $("<li data-id='" + msg.StoryId + "' data-position='" + msg.Position + "' class='story" + blockedClass + bugClass + "'><div>" + msg.Name + "</div></li>");

            var ul = body.find(".list ul[data-id='" + msg.ListId + "']");
            var li = findFirstLiWithPositionAfter(ul, parseFloat(msg.Position));
            if (li === null) {
                ul.append(liForNewStory);
            } else {
                li.before(liForNewStory);
            }

        } else if (msg.MessageType === "ChangeStoryName") {

            liForStory = $(body.find("li[data-id='" + msg.StoryId + "']")[0]);
            var divInsideLiForStory = liForStory.children("div")[0];
            $(divInsideLiForStory).text(msg.Name);
            $(liForStory).toggleClass("blocked", isBlocked(msg.Name));
            $(liForStory).toggleClass("bug", isBug(msg.Name));

        } else if (msg.MessageType === "RemoveStory") {

            var liForStory = body.find("li[data-id='" + msg.StoryId + "']")[0];
            $(liForStory).remove();

        } else if (msg.MessageType === "MoveStory") {

            liForStory = $(body.find("li[data-id='" + msg.StoryId + "']")[0]).detach();
            var ul = $(body.find("ul[data-id='" + msg.NewListId + "']")[0]);
            var firstLiAfter = findFirstLiWithPositionAfter(ul, parseFloat(msg.NewPosition));
            if (firstLiAfter === null) {
                ul.append(liForStory);
            } else {
                firstLiAfter.before(liForStory);
            }
            liForStory.attr("data-position", msg.NewPosition);
        }

        processedMessages[msg.MessageId] = true;
    });
}

function isBlocked(storyName) {
    return (storyName.toLowerCase().indexOf("blocked") >= 0);
}

function isBug(storyName) {
    return (storyName.toLowerCase().indexOf("bug") >= 0);
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
        Name: $.trim(newStoryName),
        ListId: ul.attr("data-id"),
        Position: newPosition
    };
    return addNewStoryMessage;
}

function createChangeOrRemoveStoryMessage(li, newStoryName) {
    var storyId = $(li).attr("data-id");

    newStoryName = $.trim(newStoryName);
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

function createMoveStoryMessage(movedLi) {
    movedLi = $(movedLi);
    var storyAbove = movedLi.prev();
    var storyBelow = movedLi.next();
    var newPosition = "0";
    var isEmptyList = storyAbove.length === 0 && storyBelow.length === 0;
    var isAtBottomOfList = storyAbove.length !== 0 && storyBelow.length === 0;
    var isAtTopOfList = storyAbove.length === 0 && storyBelow.length !== 0;
    if (isEmptyList) {
        newPosition = "0";
    } else if (isAtBottomOfList) {
        newPosition = parseFloat(storyAbove.attr("data-position")) + 10;
    } else if (isAtTopOfList) {
        newPosition = parseFloat(storyBelow.attr("data-position")) - 10;
    } else {
        var previousPosition = parseFloat(storyAbove.attr("data-position"));
        var nextPosition = parseFloat(storyBelow.attr("data-position"));
        newPosition = previousPosition + ((nextPosition - previousPosition) / 2);
    }

    var moveStoryMessage = {
        MessageId: newGuid(),
        MessageType: "MoveStory",
        StoryId: movedLi.attr("data-id"),
        NewListId: movedLi.closest("ul").attr("data-id"),
        NewPosition: newPosition
    };
    return moveStoryMessage;
}