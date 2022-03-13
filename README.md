Wordle for Pebble
=========

Full writeup coming soon

I wrote a wordle clone for the Pebble smartwatch using PebbleJS.

[View in the Rebble appstore](https://apps.rebble.io/en_US/application/622e0e5a4a1ad20009ffd783)

![](/store_images/banner.png)

## How to play

You start on the first letter of the first word. Press up or down to cycle through the alphabet and select the letter you want, then press select to move on.
Once you press select on the final letter, the word will be guessed. 
If it's an invalid word it'll shake and vibrate. If it's valid it'll be coloured in like the real game.   
Yellow = Correct letter, wrong place   
Green = Correct letter, correct place   
No colour = It's not in the word   

![](/store_images/pebble_screenshot_2022-03-12_19-19-32.png)

Then you repeat to guess the word. Long pressing down will copy the letter in the same position of the previous word, which makes making small changes easier.
Letters that you've found aren't in the word will also be greyed out as you go.

Once you've guessed the word (or not) the score should be pushed to your timeline past (this isn't working for me at the moment though, not sure about others)

![](/store_images/pebble_screenshot_2022-03-12_19-19-44.png)



