describe("", function() {
    beforeEach(function() {
        this.addMatchers({
            toBeAGuid: function() {
                this.message = function() {
                    return "Expected " + this.actual + " to be a GUID with 32 hexadecimal characters with 4 dash separators.";
                };
                return this.actual.length == 36 && this.actual.indexOf("-") > 0;
            }
        });

        // clear list of processed messages
        processedMessages = { };
    });


    describe("When processing AddNewLists messages", function() {

        it("should add a new list", function() {
            var body = $("<div></div>");
            processMessages([{ MessageId: "1", MessageType: "AddNewList", ListId: "InDev", Name: "In Development" }], body);

            expect(body.children().length).toEqual(1);
            expect(body.children()[0].innerHTML)
                .toEqual('<div class="listHeader">In Development</div><ul data-id="InDev"></ul><div class="addNewStory">Add new story...</div>');
        });

        it("should add several lists", function() {
            var body = $("<div></div>");
            processMessages([
                    { MessageId: "1", MessageType: "AddNewList", ListId: "InDev", Name: "In Development" },
                    { MessageId: "2", MessageType: "AddNewList", ListId: "DevDone", Name: "Development Done" }], body);

            expect(body.children().length).toEqual(2);
            expect(body.children()[0].innerHTML).toEqual('<div class="listHeader">In Development</div><ul data-id="InDev"></ul><div class="addNewStory">Add new story...</div>');
            expect(body.children()[1].innerHTML).toEqual('<div class="listHeader">Development Done</div><ul data-id="DevDone"></ul><div class="addNewStory">Add new story...</div>');
        });

        it("should not re-process the same message twice", function() {
            var body = $("<div></div>");
            processMessages([
                    { MessageId: "1", MessageType: "AddNewList", ListId: "InDev", Name: "In Development" },
                    { MessageId: "1", MessageType: "AddNewList", ListId: "InDev", Name: "In Development" }], body);

            expect(body.children().length).toEqual(1);
            expect(body.children()[0].innerHTML).toEqual('<div class="listHeader">In Development</div><ul data-id="InDev"></ul><div class="addNewStory">Add new story...</div>');
        });

    });

    describe("When processing AddNewStory messages", function() {

        it("should add a new story", function() {
            var body = $("<div></div>");
            processMessages([
                    { MessageId: "1", MessageType: "AddNewList", ListId: "InDev", Name: "In Development" },
                    { MessageId: "2", MessageType: "AddNewStory", StoryId: "55", ListId: "InDev", Name: "Create Customer", Position: "1" }
                ], body);

            expect(body.find("ul li").length).toEqual(1);
            expect(body.find("ul")[0].innerHTML)
                .toEqual('<li data-id="55" class="story"><div>Create Customer</div></li>');
        });

        it("should color text in parenthesis differently", function() {
            var body = $("<div></div>");
            processMessages([
                    { MessageId: "1", MessageType: "AddNewList", ListId: "InDev", Name: "In Development" },
                    { MessageId: "2", MessageType: "AddNewStory", StoryId: "55", ListId: "InDev", Name: "Create Customer (2pts, Ash, I5)", Position: "1" }
                ], body);

            expect(body.find("ul li").length).toEqual(1);
            expect(body.find("ul")[0].innerHTML)
                .toEqual('<li data-id="55" class="story"><div>Create Customer <div class="notes">(2pts, Ash, I5)</div></div></li>');
        });

        it("should not color text missing closing parenthesis", function() {
            var body = $("<div></div>");
            processMessages([
                    { MessageId: "1", MessageType: "AddNewList", ListId: "InDev", Name: "In Development" },
                    { MessageId: "2", MessageType: "AddNewStory", StoryId: "55", ListId: "InDev", Name: "Create Customer (2pts, Ash, I5", Position: "1" }
                ], body);

            expect(body.find("ul li").length).toEqual(1);
            expect(body.find("ul")[0].innerHTML)
                .toEqual('<li data-id="55" class="story"><div>Create Customer (2pts, Ash, I5</div></li>');
        });

        it("should color story numbers differently", function() {
            var body = $("<div></div>");
            processMessages([
                    { MessageId: "1", MessageType: "AddNewList", ListId: "InDev", Name: "In Development" },
                    { MessageId: "2", MessageType: "AddNewStory", StoryId: "55", ListId: "InDev", Name: "#1234 - Create Customer", Position: "1" }
                ], body);

            expect(body.find("ul li").length).toEqual(1);
            expect(body.find("ul")[0].innerHTML)
                .toEqual('<li data-id="55" class="story"><div><span class="storyNumber">#1234</span> - Create Customer</div></li>');
        });

        it("should add css class if the story contains the word 'blocked'", function() {
            var body = $("<div></div>");
            processMessages([
                    { MessageId: "1", MessageType: "AddNewList", ListId: "InDev", Name: "In Development" },
                    { MessageId: "2", MessageType: "AddNewStory", StoryId: "55", ListId: "InDev", Name: "Create Customer BLOCKED", Position: "1" }
                ], body);

            expect(body.find("ul li").length).toEqual(1);
            expect(body.find("ul")[0].innerHTML)
                .toEqual('<li data-id="55" class="story blocked"><div>Create Customer BLOCKED</div></li>');
        });

        it("should add css class if the story contains the word 'bug'", function() {
            var body = $("<div></div>");
            processMessages([
                    { MessageId: "1", MessageType: "AddNewList", ListId: "InDev", Name: "In Development" },
                    { MessageId: "2", MessageType: "AddNewStory", StoryId: "55", ListId: "InDev", Name: "Create Customer Bug", Position: "1" }
                ], body);

            expect(body.find("ul li").length).toEqual(1);
            expect(body.find("ul")[0].innerHTML)
                .toEqual('<li data-id="55" class="story bug"><div>Create Customer Bug</div></li>');
        });

        it("should add new story at top of list (based on position)", function() {
            var body = $("<div></div>");
            processMessages([
                    { MessageId: "1", MessageType: "AddNewList", ListId: "InDev", Name: "In Development" },
                    { MessageId: "2", MessageType: "AddNewStory", StoryId: "55", ListId: "InDev", Name: "Create Customer", Position: "1" },
                    { MessageId: "3", MessageType: "AddNewStory", StoryId: "56", ListId: "InDev", Name: "Create Invoice", Position: "1" }
                ], body);

            expect(body.find("ul li").length).toEqual(2);
            expect(body.find("ul")[0].innerHTML)
                .toEqual(
                    '<li data-id="56" class="story"><div>Create Invoice</div></li>' +
                        '<li data-id="55" class="story"><div>Create Customer</div></li>');
        });

        it("should add new story in middle of list (based on position)", function() {
            var body = $("<div></div>");
            processMessages([
                    { MessageId: "1", MessageType: "AddNewList", ListId: "InDev", Name: "In Development" },
                    { MessageId: "2", MessageType: "AddNewStory", StoryId: "55", ListId: "InDev", Name: "Create Customer", Position: "1" },
                    { MessageId: "3", MessageType: "AddNewStory", StoryId: "56", ListId: "InDev", Name: "Create Invoice", Position: "2" },
                    { MessageId: "4", MessageType: "AddNewStory", StoryId: "57", ListId: "InDev", Name: "Create Account", Position: "2" }
                ], body);

            expect(body.find("ul li").length).toEqual(3);
            expect(body.find("ul")[0].innerHTML)
                .toEqual(
                    '<li data-id="55" class="story"><div>Create Customer</div></li>' +
                        '<li data-id="57" class="story"><div>Create Account</div></li>' +
                            '<li data-id="56" class="story"><div>Create Invoice</div></li>');
        });

        it("should add stories to different lists", function() {
            var body = $("<div></div>");
            processMessages([
                    { MessageId: "1", MessageType: "AddNewList", ListId: "InDev", Name: "In Development" },
                    { MessageId: "2", MessageType: "AddNewList", ListId: "DevDone", Name: "Development Done" },
                    { MessageId: "3", MessageType: "AddNewStory", StoryId: "55", ListId: "InDev", Name: "Create Customer", Position: "1" },
                    { MessageId: "4", MessageType: "AddNewStory", StoryId: "56", ListId: "DevDone", Name: "Create Invoice", Position: "1" },
                    { MessageId: "5", MessageType: "AddNewStory", StoryId: "57", ListId: "InDev", Name: "Create Account", Position: "1" }
                ], body);

            expect(body.find("ul li").length).toEqual(3);
            expect(body.find("ul")[0].innerHTML)
                .toEqual(
                    '<li data-id="57" class="story"><div>Create Account</div></li>' +
                        '<li data-id="55" class="story"><div>Create Customer</div></li>');
            expect(body.find("ul")[1].innerHTML)
                .toEqual(
                    '<li data-id="56" class="story"><div>Create Invoice</div></li>');
        });
    });

    describe("When processing a ChangeStoryNameMessage", function () {
        
        it("should update the correct story name", function() {
            var body = $("<div></div>");
            processMessages([
                    { MessageId: "1", MessageType: "AddNewList", ListId: "InDev", Name: "In Development" },
                    { MessageId: "2", MessageType: "AddNewStory", StoryId: "55", ListId: "InDev", Name: "Create Customer", Position: "1" },
                    { MessageId: "3", MessageType: "AddNewStory", StoryId: "56", ListId: "InDev", Name: "Create Invoice", Position: "2" },
                    { MessageId: "4", MessageType: "AddNewStory", StoryId: "57", ListId: "InDev", Name: "Create Account", Position: "3" },
                    { MessageId: "5", MessageType: "ChangeStoryName", StoryId: "56", ListId: "InDev", Name: "New Story Name" }
                ], body);

            expect(body.find("ul li").length).toEqual(3);
            expect(body.find("ul li[data-id='55'] div")[0].innerHTML).toEqual("Create Customer");
            expect(body.find("ul li[data-id='56'] div")[0].innerHTML).toEqual("New Story Name");
            expect(body.find("ul li[data-id='57'] div")[0].innerHTML).toEqual("Create Account");
        });

        it("should color text in parenthesis differently", function() {
            var body = $("<div></div>");
            processMessages([
                    { MessageId: "1", MessageType: "AddNewList", ListId: "InDev", Name: "In Development" },
                    { MessageId: "3", MessageType: "AddNewStory", StoryId: "55", ListId: "InDev", Name: "Create Invoice", Position: "2" },
                    { MessageId: "5", MessageType: "ChangeStoryName", StoryId: "55", ListId: "InDev", Name: "Create Invoice (2pts, Ash, I5)" }
                ], body);

            expect(body.find("ul li[data-id='55'] div")[0].innerHTML).toEqual('Create Invoice <div class="notes">(2pts, Ash, I5)</div>');
        });

        it("should color story numbers differently", function() {
            var body = $("<div></div>");
            processMessages([
                    { MessageId: "1", MessageType: "AddNewList", ListId: "InDev", Name: "In Development" },
                    { MessageId: "3", MessageType: "AddNewStory", StoryId: "55", ListId: "InDev", Name: "Create Invoice", Position: "2" },
                    { MessageId: "5", MessageType: "ChangeStoryName", StoryId: "55", ListId: "InDev", Name: "#1234 - Create Invoice" }
                ], body);

            expect(body.find("ul li[data-id='55'] div")[0].innerHTML).toEqual('<span class="storyNumber">#1234</span> - Create Invoice');
        });

        it("should add the blocked css style when the new story name contains the word 'blocked'", function() {
            var body = $("<div></div>");
            processMessages([
                    { MessageId: "1", MessageType: "AddNewList", ListId: "InDev", Name: "In Development" },
                    { MessageId: "2", MessageType: "AddNewStory", StoryId: "55", ListId: "InDev", Name: "Create Customer", Position: "1" },
                    { MessageId: "5", MessageType: "ChangeStoryName", StoryId: "55", ListId: "InDev", Name: "Create Customer BLOCKED" }
                ], body);

            expect(body.find("ul li").length).toEqual(1);
            expect(body.find("ul")[0].innerHTML)
                .toEqual(
                    '<li data-id="55" class="story blocked"><div>Create Customer BLOCKED</div></li>');
        });

        it("should remove the blocked css style when the new story name does not contain the word 'blocked'", function() {
            var body = $("<div></div>");
            processMessages([
                    { MessageId: "1", MessageType: "AddNewList", ListId: "InDev", Name: "In Development" },
                    { MessageId: "2", MessageType: "AddNewStory", StoryId: "55", ListId: "InDev", Name: "Create Customer", Position: "1" },
                    { MessageId: "3", MessageType: "ChangeStoryName", StoryId: "55", ListId: "InDev", Name: "Create Customer BLOCKED" },
                    { MessageId: "4", MessageType: "ChangeStoryName", StoryId: "55", ListId: "InDev", Name: "Create Customer" }
                ], body);

            expect(body.find("ul li").length).toEqual(1);
            expect(body.find("ul")[0].innerHTML)
                .toEqual(
                    '<li data-id="55" class="story"><div>Create Customer</div></li>');
        });

        it("should add the blocked css style when the new story name contains the word 'bug'", function() {
            var body = $("<div></div>");
            processMessages([
                    { MessageId: "1", MessageType: "AddNewList", ListId: "InDev", Name: "In Development" },
                    { MessageId: "2", MessageType: "AddNewStory", StoryId: "55", ListId: "InDev", Name: "Create Customer", Position: "1" },
                    { MessageId: "5", MessageType: "ChangeStoryName", StoryId: "55", ListId: "InDev", Name: "Create Customer Bug" }
                ], body);

            expect(body.find("ul li").length).toEqual(1);
            expect(body.find("ul")[0].innerHTML)
                .toEqual(
                    '<li data-id="55" class="story bug"><div>Create Customer Bug</div></li>');
        });

        it("should remove the blocked css style when the new story name does not contain the word 'bug'", function() {
            var body = $("<div></div>");
            processMessages([
                    { MessageId: "1", MessageType: "AddNewList", ListId: "InDev", Name: "In Development" },
                    { MessageId: "2", MessageType: "AddNewStory", StoryId: "55", ListId: "InDev", Name: "Create Customer", Position: "1" },
                    { MessageId: "3", MessageType: "ChangeStoryName", StoryId: "55", ListId: "InDev", Name: "Create Customer Bug" },
                    { MessageId: "4", MessageType: "ChangeStoryName", StoryId: "55", ListId: "InDev", Name: "Create Customer" }
                ], body);

            expect(body.find("ul li").length).toEqual(1);
            expect(body.find("ul")[0].innerHTML)
                .toEqual(
                    '<li data-id="55" class="story"><div>Create Customer</div></li>');
        });
    });

    describe("When processing a RemoveStoryMessage", function() {
        it("should remove story", function() {
            var body = $("<div></div>");
            processMessages([
                    { MessageId: "1", MessageType: "AddNewList", ListId: "InDev", Name: "In Development" },
                    { MessageId: "2", MessageType: "AddNewStory", StoryId: "55", ListId: "InDev", Name: "Create Customer", Position: "1" },
                    { MessageId: "3", MessageType: "AddNewStory", StoryId: "56", ListId: "InDev", Name: "Create Invoice", Position: "2" },
                    { MessageId: "4", MessageType: "AddNewStory", StoryId: "57", ListId: "InDev", Name: "Create Account", Position: "3" },
                    { MessageId: "5", MessageType: "RemoveStory", StoryId: "56" }
                ], body);

            expect(body.find("ul li").length).toEqual(2);
            expect(body.find("ul li[data-id='55'] div")[0].innerHTML).toEqual("Create Customer");
            expect(body.find("ul li[data-id='57'] div")[0].innerHTML).toEqual("Create Account");
        });
    });

    describe("When processing a MoveStoryMessage", function() {

        it("should move to an empty list", function() {
            var body = $("<div></div>");
            processMessages([
                    { MessageId: "1", MessageType: "AddNewList", ListId: "InDev", Name: "In Development" },
                    { MessageId: "2", MessageType: "AddNewList", ListId: "DevDone", Name: "Development Done" },
                    { MessageId: "3", MessageType: "AddNewStory", StoryId: "55", ListId: "InDev", Name: "Create Customer", Position: "1" },
                    { MessageId: "4", MessageType: "AddNewStory", StoryId: "56", ListId: "InDev", Name: "Create Invoice", Position: "2" },
                    { MessageId: "5", MessageType: "AddNewStory", StoryId: "57", ListId: "InDev", Name: "Create Account", Position: "3" },
                    { MessageId: "6", MessageType: "MoveStory", StoryId: "56", NewListId: "DevDone", NewPosition: "1" }
                ], body);

            expect(body.find("ul[data-id='InDev'] li").length).toEqual(2);
            expect(body.find("ul[data-id='DevDone'] li").length).toEqual(1);
            expect(body.find("ul[data-id='DevDone'] li")[0].outerHTML).toEqual('<li data-id="56" class="story"><div>Create Invoice</div></li>');
        });

        it("should move to the middle of the list", function() {
            var body = $("<div></div>");
            processMessages([
                    { MessageId: "1", MessageType: "AddNewList", ListId: "InDev", Name: "In Development" },
                    { MessageId: "2", MessageType: "AddNewStory", StoryId: "55", ListId: "InDev", Name: "Create Customer", Position: "1" },
                    { MessageId: "3", MessageType: "AddNewStory", StoryId: "56", ListId: "InDev", Name: "Create Invoice", Position: "2" },
                    { MessageId: "4", MessageType: "AddNewStory", StoryId: "57", ListId: "InDev", Name: "Create Account", Position: "3" },
                    { MessageId: "5", MessageType: "MoveStory", StoryId: "57", NewListId: "InDev", NewPosition: "2" }
                ], body);

            expect(body.find("ul[data-id='InDev'] li").length).toEqual(3);
            expect(body.find("ul[data-id='InDev'] li div")[1].innerHTML).toEqual("Create Account");
        });

        it("should move to the top of the list", function() {
            var body = $("<div></div>");
            processMessages([
                    { MessageId: "1", MessageType: "AddNewList", ListId: "InDev", Name: "In Development" },
                    { MessageId: "2", MessageType: "AddNewStory", StoryId: "55", ListId: "InDev", Name: "Create Customer", Position: "1" },
                    { MessageId: "3", MessageType: "AddNewStory", StoryId: "56", ListId: "InDev", Name: "Create Invoice", Position: "2" },
                    { MessageId: "4", MessageType: "AddNewStory", StoryId: "57", ListId: "InDev", Name: "Create Account", Position: "3" },
                    { MessageId: "5", MessageType: "MoveStory", StoryId: "57", NewListId: "InDev", NewPosition: "1" }
                ], body);

            expect(body.find("ul[data-id='InDev'] li").length).toEqual(3);
            expect(body.find("ul[data-id='InDev'] li div")[0].innerHTML).toEqual("Create Account");
        });

        it("should move to the bottom of the list", function() {
            var body = $("<div></div>");
            processMessages([
                    { MessageId: "1", MessageType: "AddNewList", ListId: "InDev", Name: "In Development" },
                    { MessageId: "2", MessageType: "AddNewStory", StoryId: "55", ListId: "InDev", Name: "Create Customer", Position: "1" },
                    { MessageId: "3", MessageType: "AddNewStory", StoryId: "56", ListId: "InDev", Name: "Create Invoice", Position: "2" },
                    { MessageId: "4", MessageType: "AddNewStory", StoryId: "57", ListId: "InDev", Name: "Create Account", Position: "3" },
                    { MessageId: "5", MessageType: "MoveStory", StoryId: "55", NewListId: "InDev", NewPosition: "3" }
                ], body);

            expect(body.find("ul[data-id='InDev'] li").length).toEqual(3);
            expect(body.find("ul[data-id='InDev'] li div")[2].innerHTML).toEqual("Create Customer");
        });
    });

    describe("When creating an AddNewStory message", function() {

        it("should create message", function() {
            var ul = $("<ul data-id='InDev'></ul>");

            var msg = createAddNewStoryMessage(ul, "Create Customer");

            expect(msg.MessageId).toBeAGuid();
            expect(msg.StoryId).toBeAGuid();
            expect(msg.MessageId).not.toEqual(msg.StoryId);
            expect(msg.MessageType).toEqual("AddNewStory");
            expect(msg.Name).toEqual("Create Customer");
            expect(msg.ListId).toEqual("InDev");
            expect(msg.Position).toEqual(1);
        });

        it("should set position to index in the list (1 based)", function() {
            var ul = $("<ul data-id='InDev'><li/><li/></ul>");

            var msg = createAddNewStoryMessage(ul, "Create Customer");

            expect(msg.Position).toEqual(3);
        });
    });

    describe("When creating a ChangeStoryNameMessage or RemoveStoryMessage", function() {

        it("should create change message", function() {
            var li = $("<li data-id='5'><div>OldName</div></li>");

            var msg = createChangeOrRemoveStoryMessage(li, "New Story Name");

            expect(msg.MessageId).toBeAGuid();
            expect(msg.MessageType).toEqual("ChangeStoryName");
            expect(msg.StoryId).toEqual("5");
            expect(msg.Name).toEqual("New Story Name");
        });

        it("should create remove message when new story name is blank", function() {
            var li = $("<li data-id='5'><div>Create Customer</div></li>");

            var msg = createChangeOrRemoveStoryMessage(li, "");

            expect(msg.MessageId).toBeAGuid();
            expect(msg.MessageType).toEqual("RemoveStory");
            expect(msg.StoryId).toEqual("5");
        });
    });

    describe("When creating a MoveStoryMessage", function() {

        it("should create move message", function() {
            var ul = $("<ul data-id='InDev'><li data-id='5'/></ul>");
            var movedLi = ul.children("li")[0];

            var msg = createMoveStoryMessage(movedLi);

            expect(msg.MessageId).toBeAGuid();
            expect(msg.MessageType).toEqual("MoveStory");
            expect(msg.StoryId).toEqual("5");
            expect(msg.NewListId).toEqual("InDev");
        });

        it("should set NewPosition when moving in the middle of a list", function() {
            var ul = $("<ul data-id='InDev'><li data-id='4' /><li data-id='5' /><li data-id='6' /></ul>");
            var movedLi = ul.children("li[data-id='5']")[0];

            var msg = createMoveStoryMessage(movedLi);

            expect(msg.NewPosition).toEqual(2);
        });

        it("should set NewPosition=1 when moving to an empty list", function() {
            var ul = $("<ul data-id='InDev'><li data-id='5'/></ul>");
            var movedLi = ul.children("li")[0];

            var msg = createMoveStoryMessage(movedLi);

            expect(msg.NewPosition).toEqual(1);
        });

        it("should set NewPosition to 1 when moving to the top of a list", function() {
            var ul = $("<ul data-id='InDev'><li data-id='5' /><li data-id='6' /></ul>");
            var movedLi = ul.children("li[data-id='5']")[0];

            var msg = createMoveStoryMessage(movedLi);

            expect(msg.NewPosition).toEqual(1);
        });

        it("should set NewPosition when moving to bottom of the list", function() {
            var ul = $("<ul data-id='InDev'><li data-id='6' /><li data-id='5' /></ul>");
            var movedLi = ul.children("li[data-id='5']")[0];

            var msg = createMoveStoryMessage(movedLi);

            expect(msg.NewPosition).toEqual(2);
        });
    });
});