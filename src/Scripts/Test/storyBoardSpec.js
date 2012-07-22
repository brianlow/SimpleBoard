describe("StoryBoard", function () {
    beforeEach(function () {
        this.addMatchers({
            toBeAGuid: function () {
                this.message = function () {
                    return "Expected " + this.actual + " to be a GUID with 32 hexadecimal characters with 4 dash separators.";
                };
                return this.actual.length == 36 && this.actual.indexOf("-") > 0;
            }
        });

        // clear list of processed messages
        processedMessages = {};
    });


    describe("When processing AddNewLists messages", function () {

        it("should add a new list", function () {
            var body = $("<div></div>");
            processMessages([{ MessageId: "1", MessageType: "AddNewList", ListId: "InDev", Name: "In Development"}], body);

            expect(body.children().length).toEqual(1);
            expect(body.children()[0].innerHTML)
                .toEqual('<div class="listHeader">In Development</div><ul data-id="InDev"></ul><div class="addNewStory">Add new story...</div>');
        });

        it("should add several lists", function () {
            var body = $("<div></div>");
            processMessages([
                    { MessageId: "1", MessageType: "AddNewList", ListId: "InDev", Name: "In Development" },
                    { MessageId: "2", MessageType: "AddNewList", ListId: "DevDone", Name: "Development Done"}], body);

            expect(body.children().length).toEqual(2);
            expect(body.children()[0].innerHTML).toEqual('<div class="listHeader">In Development</div><ul data-id="InDev"></ul><div class="addNewStory">Add new story...</div>');
            expect(body.children()[1].innerHTML).toEqual('<div class="listHeader">Development Done</div><ul data-id="DevDone"></ul><div class="addNewStory">Add new story...</div>');
        });

        it("should not re-process the same message twice", function () {
            var body = $("<div></div>");
            processMessages([
                    { MessageId: "1", MessageType: "AddNewList", ListId: "InDev", Name: "In Development" },
                    { MessageId: "1", MessageType: "AddNewList", ListId: "InDev", Name: "In Development"}], body);

            expect(body.children().length).toEqual(1);
            expect(body.children()[0].innerHTML).toEqual('<div class="listHeader">In Development</div><ul data-id="InDev"></ul><div class="addNewStory">Add new story...</div>');
        });

    });

    describe("When processing AddNewStory messages", function () {

        it("should add a new story", function () {
            var body = $("<div></div>");
            processMessages([
                    { MessageId: "1", MessageType: "AddNewList", ListId: "InDev", Name: "In Development" },
                    { MessageId: "2", MessageType: "AddNewStory", StoryId: "55", ListId: "InDev", Name: "Create Customer", Position: "0" }
                ], body);

            expect(body.find("ul li").length).toEqual(1);
            expect(body.find("ul")[0].innerHTML)
                .toEqual('<li data-id="55" data-position="0" class="story"><div>Create Customer</div></li>');
        });

        it("should add new story at top of list (based on position)", function () {
            var body = $("<div></div>");
            processMessages([
                        { MessageId: "1", MessageType: "AddNewList", ListId: "InDev", Name: "In Development" },
                        { MessageId: "2", MessageType: "AddNewStory", StoryId: "55", ListId: "InDev", Name: "Create Customer", Position: "10" },
                        { MessageId: "3", MessageType: "AddNewStory", StoryId: "56", ListId: "InDev", Name: "Create Invoice", Position: "5" }
                    ], body);

            expect(body.find("ul li").length).toEqual(2);
            expect(body.find("ul")[0].innerHTML)
                .toEqual(
                    '<li data-id="56" data-position="5" class="story"><div>Create Invoice</div></li>' +
                        '<li data-id="55" data-position="10" class="story"><div>Create Customer</div></li>');
        });

        it("should add new story in middle of list (based on position)", function () {
            var body = $("<div></div>");
            processMessages([
                        { MessageId: "1", MessageType: "AddNewList", ListId: "InDev", Name: "In Development" },
                        { MessageId: "2", MessageType: "AddNewStory", StoryId: "55", ListId: "InDev", Name: "Create Customer", Position: "10" },
                        { MessageId: "3", MessageType: "AddNewStory", StoryId: "56", ListId: "InDev", Name: "Create Invoice", Position: "20" },
                        { MessageId: "4", MessageType: "AddNewStory", StoryId: "57", ListId: "InDev", Name: "Create Account", Position: "15" }
                    ], body);

            expect(body.find("ul li").length).toEqual(3);
            expect(body.find("ul")[0].innerHTML)
                .toEqual(
                    '<li data-id="55" data-position="10" class="story"><div>Create Customer</div></li>' +
                        '<li data-id="57" data-position="15" class="story"><div>Create Account</div></li>' +
                            '<li data-id="56" data-position="20" class="story"><div>Create Invoice</div></li>');
        });

        it("should add stories to different lists", function () {
            var body = $("<div></div>");
            processMessages([
                        { MessageId: "1", MessageType: "AddNewList", ListId: "InDev", Name: "In Development" },
                        { MessageId: "2", MessageType: "AddNewList", ListId: "DevDone", Name: "Development Done" },
                        { MessageId: "3", MessageType: "AddNewStory", StoryId: "55", ListId: "InDev", Name: "Create Customer", Position: "10" },
                        { MessageId: "4", MessageType: "AddNewStory", StoryId: "56", ListId: "DevDone", Name: "Create Invoice", Position: "15" },
                        { MessageId: "5", MessageType: "AddNewStory", StoryId: "57", ListId: "InDev", Name: "Create Account", Position: "5" }
                    ], body);

            expect(body.find("ul li").length).toEqual(3);
            expect(body.find("ul")[0].innerHTML)
                .toEqual(
                    '<li data-id="57" data-position="5" class="story"><div>Create Account</div></li>' +
                        '<li data-id="55" data-position="10" class="story"><div>Create Customer</div></li>');
            expect(body.find("ul")[1].innerHTML)
                .toEqual(
                    '<li data-id="56" data-position="15" class="story"><div>Create Invoice</div></li>');
        });

        // TODO: BL - move story
        // TODO: BL - delete story
        // TODO: BL - record time and user with message
    });

    describe("When processing a ChangeStoryNameMessage", function () {
        it("should update the correct story name", function () {
            var body = $("<div></div>");
            processMessages([
                        { MessageId: "1", MessageType: "AddNewList", ListId: "InDev", Name: "In Development" },
                        { MessageId: "2", MessageType: "AddNewStory", StoryId: "55", ListId: "InDev", Name: "Create Customer", Position: "0" },
                        { MessageId: "3", MessageType: "AddNewStory", StoryId: "56", ListId: "InDev", Name: "Create Invoice", Position: "10" },
                        { MessageId: "4", MessageType: "AddNewStory", StoryId: "57", ListId: "InDev", Name: "Create Account", Position: "20" },
                        { MessageId: "5", MessageType: "ChangeStoryName", StoryId: "56", ListId: "InDev", Name: "New Story Name" }
                    ], body);

            expect(body.find("ul li").length).toEqual(3);
            expect(body.find("ul li[data-id='55'] div")[0].innerHTML).toEqual("Create Customer");
            expect(body.find("ul li[data-id='56'] div")[0].innerHTML).toEqual("New Story Name");
            expect(body.find("ul li[data-id='57'] div")[0].innerHTML).toEqual("Create Account");
        });
    });

    describe("When processing a RemoveStoryMessage", function () {
        it("should remove story", function () {
            var body = $("<div></div>");
            processMessages([
                        { MessageId: "1", MessageType: "AddNewList", ListId: "InDev", Name: "In Development" },
                        { MessageId: "2", MessageType: "AddNewStory", StoryId: "55", ListId: "InDev", Name: "Create Customer", Position: "0" },
                        { MessageId: "3", MessageType: "AddNewStory", StoryId: "56", ListId: "InDev", Name: "Create Invoice", Position: "10" },
                        { MessageId: "4", MessageType: "AddNewStory", StoryId: "57", ListId: "InDev", Name: "Create Account", Position: "20" },
                        { MessageId: "5", MessageType: "RemoveStory", StoryId: "56" }
                    ], body);

            expect(body.find("ul li").length).toEqual(2);
            expect(body.find("ul li[data-id='55'] div")[0].innerHTML).toEqual("Create Customer");
            expect(body.find("ul li[data-id='57'] div")[0].innerHTML).toEqual("Create Account");
        });
    });

    describe("When processing a MoveStoryMessage", function () {

        it("should move to an empty list", function () {
            var body = $("<div></div>");
            processMessages([
                        { MessageId: "1", MessageType: "AddNewList", ListId: "InDev", Name: "In Development" },
                        { MessageId: "2", MessageType: "AddNewList", ListId: "DevDone", Name: "Development Done" },
                        { MessageId: "3", MessageType: "AddNewStory", StoryId: "55", ListId: "InDev", Name: "Create Customer", Position: "0" },
                        { MessageId: "4", MessageType: "AddNewStory", StoryId: "56", ListId: "InDev", Name: "Create Invoice", Position: "10" },
                        { MessageId: "5", MessageType: "AddNewStory", StoryId: "57", ListId: "InDev", Name: "Create Account", Position: "20" },
                        { MessageId: "6", MessageType: "MoveStory", StoryId: "56", NewListId: "DevDone", NewPosition: "0" }
                    ], body);

            expect(body.find("ul[data-id='InDev'] li").length).toEqual(2);
            expect(body.find("ul[data-id='DevDone'] li").length).toEqual(1);
            expect(body.find("ul[data-id='DevDone'] li")[0].outerHTML).toEqual('<li data-id="56" data-position="0" class="story"><div>Create Invoice</div></li>');
        });

        it("should move to the middle of the list", function () {
            var body = $("<div></div>");
            processMessages([
                        { MessageId: "1", MessageType: "AddNewList", ListId: "InDev", Name: "In Development" },
                        { MessageId: "2", MessageType: "AddNewStory", StoryId: "55", ListId: "InDev", Name: "Create Customer", Position: "0" },
                        { MessageId: "3", MessageType: "AddNewStory", StoryId: "56", ListId: "InDev", Name: "Create Invoice", Position: "10" },
                        { MessageId: "4", MessageType: "AddNewStory", StoryId: "57", ListId: "InDev", Name: "Create Account", Position: "20" },
                        { MessageId: "5", MessageType: "MoveStory", StoryId: "57", NewListId: "InDev", NewPosition: "5" }
                    ], body);

            expect(body.find("ul[data-id='InDev'] li").length).toEqual(3);
            expect($(body.find("ul[data-id='InDev'] li")[1]).attr("data-position")).toEqual("5");
            expect(body.find("ul[data-id='InDev'] li div")[1].innerHTML).toEqual("Create Account");
        });

        it("should move to the top of the list", function () {
            var body = $("<div></div>");
            processMessages([
                        { MessageId: "1", MessageType: "AddNewList", ListId: "InDev", Name: "In Development" },
                        { MessageId: "2", MessageType: "AddNewStory", StoryId: "55", ListId: "InDev", Name: "Create Customer", Position: "0" },
                        { MessageId: "3", MessageType: "AddNewStory", StoryId: "56", ListId: "InDev", Name: "Create Invoice", Position: "10" },
                        { MessageId: "4", MessageType: "AddNewStory", StoryId: "57", ListId: "InDev", Name: "Create Account", Position: "20" },
                        { MessageId: "5", MessageType: "MoveStory", StoryId: "57", NewListId: "InDev", NewPosition: "-10" }
                    ], body);

            expect(body.find("ul[data-id='InDev'] li").length).toEqual(3);
            expect($(body.find("ul[data-id='InDev'] li")[0]).attr("data-position")).toEqual("-10");
            expect(body.find("ul[data-id='InDev'] li div")[0].innerHTML).toEqual("Create Account");
        });

        it("should move to the bottom of the list", function () {
            var body = $("<div></div>");
            processMessages([
                        { MessageId: "1", MessageType: "AddNewList", ListId: "InDev", Name: "In Development" },
                        { MessageId: "2", MessageType: "AddNewStory", StoryId: "55", ListId: "InDev", Name: "Create Customer", Position: "0" },
                        { MessageId: "3", MessageType: "AddNewStory", StoryId: "56", ListId: "InDev", Name: "Create Invoice", Position: "10" },
                        { MessageId: "4", MessageType: "AddNewStory", StoryId: "57", ListId: "InDev", Name: "Create Account", Position: "20" },
                        { MessageId: "5", MessageType: "MoveStory", StoryId: "55", NewListId: "InDev", NewPosition: "30" }
                    ], body);

            expect(body.find("ul[data-id='InDev'] li").length).toEqual(3);
            expect($(body.find("ul[data-id='InDev'] li")[2]).attr("data-position")).toEqual("30");
            expect(body.find("ul[data-id='InDev'] li div")[2].innerHTML).toEqual("Create Customer");
        });
    });

    describe("When creating an AddNewStory message", function () {

        it("should create message", function () {
            var ul = $("<ul data-id='InDev'></ul>");

            var msg = createAddNewStoryMessage(ul, "Create Customer");

            expect(msg.MessageId).toBeAGuid();
            expect(msg.StoryId).toBeAGuid();
            expect(msg.MessageId).not.toEqual(msg.StoryId);
            expect(msg.MessageType).toEqual("AddNewStory");
            expect(msg.Name).toEqual("Create Customer");
            expect(msg.ListId).toEqual("InDev");
            expect(msg.Position).toEqual(0);
        });

        it("should set position to 10 plus last story", function () {
            var ul = $("<ul data-id='InDev'><li data-position='10'/><li data-position='20'/></ul>");

            var msg = createAddNewStoryMessage(ul, "Create Customer");

            expect(msg.Position).toEqual(30);
        });
    });

    describe("When creating a ChangeStoryNameMessage or RemoveStoryMessage", function () {

        it("should create change message", function () {
            var li = $("<li data-id='5'><div>OldName</div></li>");

            var msg = createChangeOrRemoveStoryMessage(li, "New Story Name");

            expect(msg.MessageId).toBeAGuid();
            expect(msg.MessageType).toEqual("ChangeStoryName");
            expect(msg.StoryId).toEqual("5");
            expect(msg.Name).toEqual("New Story Name");
        });

        it("should create remove message when new story name is blank", function () {
            var li = $("<li data-id='5'><div>Create Customer</div></li>");

            var msg = createChangeOrRemoveStoryMessage(li, "");

            expect(msg.MessageId).toBeAGuid();
            expect(msg.MessageType).toEqual("RemoveStory");
            expect(msg.StoryId).toEqual("5");
        });
    });

    describe("When creating a MoveStoryMessage", function () {

        it("should create move message", function () {
            var ul = $("<ul data-id='InDev'><li data-id='5' data-position='10'/></ul>");
            var movedLi = ul.children("li")[0];

            var msg = createMoveStoryMessage(movedLi);

            expect(msg.MessageId).toBeAGuid();
            expect(msg.MessageType).toEqual("MoveStory");
            expect(msg.StoryId).toEqual("5");
            expect(msg.NewListId).toEqual("InDev");
        });

        it("should set NewPosition to half way between the position of the story above and story below", function () {
            var ul = $("<ul data-id='InDev'><li data-id='4' data-position='10'/><li data-id='5' /><li data-id='6' data-position='20'/></ul>");
            var movedLi = ul.children("li[data-id='5']")[0];

            var msg = createMoveStoryMessage(movedLi);

            expect(msg.NewPosition).toEqual(15);
        });

        it("should set NewPosition=0 when moving to an empty list", function () {
            var ul = $("<ul data-id='InDev'><li data-id='5' data-position='10'/></ul>");
            var movedLi = ul.children("li")[0];

            var msg = createMoveStoryMessage(movedLi);

            expect(msg.MessageId).toBeAGuid();
            expect(msg.MessageType).toEqual("MoveStory");
            expect(msg.StoryId).toEqual("5");
            expect(msg.NewListId).toEqual("InDev");
        });

        it("should set NewPosition to 10 less then the old top story when moving to the top of a list", function () {
            var ul = $("<ul data-id='InDev'><li data-id='5' /><li data-id='6' data-position='25'/></ul>");
            var movedLi = ul.children("li[data-id='5']")[0];

            var msg = createMoveStoryMessage(movedLi);

            expect(msg.NewPosition).toEqual(15);
        });

        it("should set NewPosition to 10 more then bottom story when moving to the bottom of a list", function () {
            var ul = $("<ul data-id='InDev'><li data-id='6' data-position='25'/><li data-id='5' /></ul>");
            var movedLi = ul.children("li[data-id='5']")[0];

            var msg = createMoveStoryMessage(movedLi);

            expect(msg.NewPosition).toEqual(35);
        });
    });
});