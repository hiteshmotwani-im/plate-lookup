# Plate lookup — simple setup guide (Mac)

This little app lets you type a car plate number and get the car's details back.
You'll first run it in PRACTICE MODE (built-in sample cars, free, nothing to sign
up for), then switch it to the REAL service.

You do NOT need to be a developer. Follow the steps in order.

------------------------------------------------------------
PART 1 — Install the free tool that runs the app (one time only)
------------------------------------------------------------

1. Open Safari and go to:  nodejs.org
2. Click the big green button (it says "LTS"). A file downloads.
3. Open that downloaded file (look in your Downloads folder, it ends in .pkg).
4. Click Continue, Continue, Agree, Install. Type your Mac password if asked.
5. When it says the install was successful, click Close. Done — forever.

------------------------------------------------------------
PART 2 — Put the app on your computer (one time only)
------------------------------------------------------------

6. Download the file "plate-lookup.zip" (the one shared with this guide).
   It goes into your Downloads folder.
7. Double-click that zip file. It turns into a folder called "plate-lookup".
8. Leave that folder in Downloads. Don't move it (keeps the steps below exact).

------------------------------------------------------------
PART 3 — Run it in PRACTICE MODE (see it working, costs nothing)
------------------------------------------------------------

9. Open the Terminal app:
   - Press Command (⌘) and the Spacebar together.
   - Type:  Terminal
   - Press Return. A small window with text opens.

10. Click into that Terminal window, then copy the line below, paste it in
    (Command + V), and press Return:

        cd ~/Downloads/plate-lookup && npm install && npm start

    The first time, it spends a minute getting ready. When it's done you'll see:
        "Plate lookup is running."
        "Mode: MOCK (sample data)"
    Leave this window open.

11. Open Safari (or Chrome) and go to:  http://localhost:3000
12. In the boxes type:  Emirate = DXB,  Code = F,  Number = 33333
    Click "Look up vehicle". You should see a Hyundai Santa Fe appear.

    That's the whole experience: one plate in, car details out.

To STOP it: click the Terminal window and press Control + C.

------------------------------------------------------------
PART 4 — Switch to the REAL service
------------------------------------------------------------

First, get a free account:
13. In Safari go to:  carregistrationapi.ae
14. Click "Register" (near the bottom). Choose a username and password, enter
    your email, submit, and confirm the email they send you.
    You now have 10 free lookups. Remember your USERNAME.

Then point the app at the real service:
15. Open the "plate-lookup" folder in Downloads.
16. Double-click the file "settings.txt" (it opens in TextEdit).
17. Change these two lines:
        USERNAME=        ->   put your username after the =, e.g.  USERNAME=johnsmith
        MODE=mock        ->   change to:  MODE=live
    Save with Command + S, then close TextEdit.

18. Go back to Terminal. If the app is still running, press Control + C to stop it.
    Then paste this line and press Return:

        cd ~/Downloads/plate-lookup && npm start

    It should now say:  "Mode: LIVE (real API)".

19. In the browser (http://localhost:3000) type DXB / F / 33333 again.
    This is the official free test plate — it returns a real car and does NOT
    use up one of your 10 credits. If you see the car, the real service works.

20. Now try a real Dubai plate (its code + number). Each real lookup uses 1 credit.

------------------------------------------------------------
GOOD TO KNOW
------------------------------------------------------------

- Dubai plates return Make and Model. Getting more (year, VIN) and other emirates
  needs a higher level of access from carregistrationapi.ae that also requires the
  car owner's Emirates ID. Email them to ask once you're ready.
- Check how many free lookups you have left by visiting this in your browser
  (put your username at the end):
  https://www.regcheck.org.uk/ajax/getcredits.aspx?username=YOUR_USERNAME

------------------------------------------------------------
IF SOMETHING GOES WRONG
------------------------------------------------------------

- "command not found: npm"  ->  Node didn't install. Redo Part 1.
- "Lookup failed"  ->  Check Part 4 step 17: username spelled correctly, MODE=live, file saved.
- Nothing at http://localhost:3000  ->  The Terminal window must still be open and
  showing "Plate lookup is running." Redo step 10.
- To run the app again any other day: open Terminal and paste the step-18 line.
