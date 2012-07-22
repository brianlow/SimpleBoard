Simple Board
============
trello but hosted locally and works in IE8

Running Tests
-------------
- Use Resharper to run all c# tests
- Open src/Scripts/Test/SpecRunner.html, OR
- Run the app and browse to http://localhost:1099/Scripts/Test/SpecRunner.html

Storage
-------
All user data is stored in App_Data/StoryBoard.json

Adding Lists
------------
At the moment, the only way to add or modify the lists is by editing the src/App_Data/StoryBoard.json file directly. Look for AddNewList messages.
