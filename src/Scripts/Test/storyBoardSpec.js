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
    });


    describe("Processing AddNewLists messages", function () {

        it("should add a new list", function () {
            var body = $("<div></div>");
            processMessages('{"Messages":[{"MessageId":"1","MessageType":"AddNewList","ListId":"InDev","Name":"In Development"}]}', body);

            expect(body.children().length).toEqual(1);
            expect(body.children()[0].innerHTML)
                .toEqual('<div class="listHeader">In Development</div><ul data-id="InDev"></ul><div class="addNewStory">Add new story...</div>');
        });

        it("should add several list", function () {
            var body = $("<div></div>");
            processMessages(
                '{"Messages":[' +
                    '{"MessageId":"1","MessageType":"AddNewList","ListId":"InDev","Name":"In Development"},' +
                        '{"MessageId":"2","MessageType":"AddNewList","ListId":"DevDone","Name":"Development Done"}]}', body);

            expect(body.children().length).toEqual(2);
            expect(body.children()[0].innerHTML).toEqual('<div class="listHeader">In Development</div><ul data-id="InDev"></ul><div class="addNewStory">Add new story...</div>');
            expect(body.children()[1].innerHTML).toEqual('<div class="listHeader">Development Done</div><ul data-id="DevDone"></ul><div class="addNewStory">Add new story...</div>');
        });

    });

    describe("Processing AddNewStory messages", function () {

        it("should add a new story", function () {
            var body = $("<div></div>");
            processMessages(
                '{"Messages":[' +
                    '{"MessageId":"1","MessageType":"AddNewList","ListId":"InDev","Name":"In Development"},' +
                        '{"MessageId":"2","MessageType":"AddNewStory","StoryId":"55","ListId":"InDev","Name":"Create Customer","Position":"0"}' +
                            ']}', body);

            expect(body.find("ul li").length).toEqual(1);
            expect(body.find("ul")[0].innerHTML)
                .toEqual('<li data-id="55" data-position="0" class="story"><div>Create Customer</div></li>');
        });

        it("should add new story at top of list (based on position)", function () {
            var body = $("<div></div>");
            processMessages(
                '{"Messages":[' +
                    '{"MessageId":"1","MessageType":"AddNewList","ListId":"InDev","Name":"In Development"},' +
                        '{"MessageId":"2","MessageType":"AddNewStory","StoryId":"55","ListId":"InDev","Name":"Create Customer","Position":"10"},' +
                            '{"MessageId":"3","MessageType":"AddNewStory","StoryId":"56","ListId":"InDev","Name":"Create Invoice","Position":"5"}' +
                                ']}', body);

            expect(body.find("ul li").length).toEqual(2);
            expect(body.find("ul")[0].innerHTML)
                .toEqual(
                    '<li data-id="56" data-position="5" class="story"><div>Create Invoice</div></li>' +
                        '<li data-id="55" data-position="10" class="story"><div>Create Customer</div></li>');
        });

        it("should add new story in middle of list (based on position)", function () {
            var body = $("<div></div>");
            processMessages(
                '{"Messages":[' +
                    '{"MessageId":"1","MessageType":"AddNewList","ListId":"InDev","Name":"In Development"},' +
                        '{"MessageId":"2","MessageType":"AddNewStory","StoryId":"55","ListId":"InDev","Name":"Create Customer","Position":"10"},' +
                            '{"MessageId":"3","MessageType":"AddNewStory","StoryId":"56","ListId":"InDev","Name":"Create Invoice","Position":"20"},' +
                                '{"MessageId":"4","MessageType":"AddNewStory","StoryId":"57","ListId":"InDev","Name":"Create Account","Position":"15"}' +
                                    ']}', body);

            expect(body.find("ul li").length).toEqual(3);
            expect(body.find("ul")[0].innerHTML)
                .toEqual(
                    '<li data-id="55" data-position="10" class="story"><div>Create Customer</div></li>' +
                        '<li data-id="57" data-position="15" class="story"><div>Create Account</div></li>' +
                            '<li data-id="56" data-position="20" class="story"><div>Create Invoice</div></li>');
        });

        it("should add stories to different lists", function () {
            var body = $("<div></div>");
            processMessages(
                '{"Messages":[' +
                    '{"MessageId":"1","MessageType":"AddNewList","ListId":"InDev","Name":"In Development"},' +
                        '{"MessageId":"2","MessageType":"AddNewList","ListId":"DevDone","Name":"Development Done"},' +
                            '{"MessageId":"3","MessageType":"AddNewStory","StoryId":"55","ListId":"InDev","Name":"Create Customer","Position":"10"},' +
                                '{"MessageId":"4","MessageType":"AddNewStory","StoryId":"56","ListId":"DevDone","Name":"Create Invoice","Position":"15"},' +
                                    '{"MessageId":"5","MessageType":"AddNewStory","StoryId":"57","ListId":"InDev","Name":"Create Account","Position":"5"}' +
                                        ']}', body);

            expect(body.find("ul li").length).toEqual(3);
            expect(body.find("ul")[0].innerHTML)
                .toEqual(
                    '<li data-id="57" data-position="5" class="story"><div>Create Account</div></li>' +
                        '<li data-id="55" data-position="10" class="story"><div>Create Customer</div></li>');
            expect(body.find("ul")[1].innerHTML)
                .toEqual(
                    '<li data-id="56" data-position="15" class="story"><div>Create Invoice</div></li>');
        });

        // TODO: BL - record time and user with message
        // TODO: BL - test outgoing message created
    });

    describe("Creating an AddNewStory message", function () {

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

    describe("Creating a ChangeStoryNameMessage", function () {

        it("should create message", function () {
            var li = $("<li data-id='5'><div>OldName</div></li>");

            var msg = createChangeStoryNameMessage(li, "New Story Name");

            expect(msg.MessageId).toBeAGuid();
            expect(msg.StoryId).toEqual("5");
            expect(msg.MessageType).toEqual("ChangeStoryName");
            expect(msg.Name).toEqual("New Story Name");
        });
    });

    describe("Processing a ChangeStoryNameMessage", function () {
        it("should update the correct story name", function() {
            

        });
    });
});