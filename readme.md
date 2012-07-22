Simple Board
============
trello but hosted locally and works in IE8

Tests
-----
* For C# unit tests, use Resharper
* for Javascript tests:
    * Run the app and browse to http://localhost:1099/Scripts/Test/SpecRunner.html, or
    * Open file://SimpleBoard/src/Scripts/Test/SpecRunner.html in a browser (but live.js won't automatically reload)

Storage
-------
All user data is stored in App_Data/StoryBoard.json

Adding Lists
------------
At the moment, the only way to add or modify the lists is by editing the src/App_Data/StoryBoard.json file directly. Look for AddNewList messages.
