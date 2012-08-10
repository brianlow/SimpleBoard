
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
            var storyName = colorStoryName(msg.Name);
            var liForNewStory = $("<li data-id='" + msg.StoryId + "' class='story" + blockedClass + bugClass + "'><div>" + storyName + "</div></li>");

            var ul = body.find(".list ul[data-id='" + msg.ListId + "']");
            var liAtTargetPosition = ul.children("li")[msg.Position - 1];
            if (liAtTargetPosition === null || liAtTargetPosition === undefined) {
                ul.append(liForNewStory);
            } else {
                $(liAtTargetPosition).before(liForNewStory);
            }

        } else if (msg.MessageType === "ChangeStoryName") {

            liForStory = $(body.find("li[data-id='" + msg.StoryId + "']")[0]);
            var divInsideLiForStory = liForStory.children("div")[0];
            storyName = colorStoryName(msg.Name);
            $(divInsideLiForStory).html(storyName);
            $(liForStory).toggleClass("blocked", isBlocked(msg.Name));
            $(liForStory).toggleClass("bug", isBug(msg.Name));

        } else if (msg.MessageType === "RemoveStory") {

            var liForStory = body.find("li[data-id='" + msg.StoryId + "']")[0];
            $(liForStory).remove();

        } else if (msg.MessageType === "MoveStory") {

            liForStory = $(body.find("li[data-id='" + msg.StoryId + "']")[0]).detach();
            var ul = $(body.find("ul[data-id='" + msg.NewListId + "']")[0]);
            liAtTargetPosition = ul.children("li")[msg.NewPosition - 1];
            if (liAtTargetPosition === null || liAtTargetPosition === undefined) {
                ul.append(liForStory);
            } else {
                $(liAtTargetPosition).before(liForStory);
            }
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

function colorStoryName(storyName) {
    var openingIndex = storyName.indexOf('(');
    var closingIndex = storyName.indexOf(')');
    if (openingIndex >= 0 && closingIndex > openingIndex) {
        storyName = storyName.insert(storyName.indexOf('('), '<div class="notes">');
        storyName = storyName.insert(storyName.lastIndexOf(')') + 1, '</div>');
    }

    var regEx = new RegExp("#[0-9]{1,5}", "g");
    storyName = storyName.replace(regEx, '<span class="storyNumber">$&</span>');
    
    return storyName;
}

String.prototype.insert = function (indexToInsertAt, stringToInsert) {
    return this.substr(0, indexToInsertAt) + stringToInsert + this.substr(indexToInsertAt);
};

function createAddNewStoryMessage(ul, newStoryName) {
    var newPosition = ul.children("li").length + 1;
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
    var ul = $(movedLi.closest("ul")[0]);
    var newPosition = ul.children("li").index(movedLi) || 0;
    newPosition = newPosition + 1;

    var moveStoryMessage = {
        MessageId: newGuid(),
        MessageType: "MoveStory",
        StoryId: movedLi.attr("data-id"),
        NewListId: ul.attr("data-id"),
        NewPosition: newPosition
    };
    return moveStoryMessage;
}