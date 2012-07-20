describe("StoryBoard", function () {

    it("should add a new list", function () {
        var body = $("<div></div>");
        processMessages('{"Messages":[{"MessageId":"1","MessageType":"AddNewList","ListId":"InDev","Name":"In Development"}]}', body);

        expect(body.children().length).toEqual(1);
        expect(body.children()[0].innerHTML)
            .toEqual('<div class="listHeader">In Development</div><ul data-id="InDev"></ul><div class="addNewStory">Add new story...</div>');
    });

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
    
    // TODO: BL - record time and user with message
    // TODO: BL - don't indent multi-line strings
    // TODO: BL - test outgoing message created
});