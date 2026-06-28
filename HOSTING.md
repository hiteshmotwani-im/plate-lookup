# Put the app online (so anyone can open a link)

Goal: turn the app into a normal web link you can send your colleague. He opens
it on any phone or computer — no installing anything.

This is all done in a web browser. No Terminal. It's a one-time setup of about
20-30 minutes. You'll make two free accounts: GitHub (stores the files) and
Render (runs them and gives you the link).

You do NOT put your username in any file here. It goes into a private setting on
Render later, so it never sits on the internet.

------------------------------------------------------------
PART A — Get the files ready
------------------------------------------------------------

1. If you haven't already, download "plate-lookup.zip" and double-click it to
   unzip. You'll have a folder called "plate-lookup".

------------------------------------------------------------
PART B — Put the files on GitHub
------------------------------------------------------------

2. Go to  github.com  and click "Sign up". Make a free account, verify your email.
3. Once logged in, click the "+" at the top-right, then "New repository".
4. Under "Repository name" type:  plate-lookup
   Choose "Private". Then click the green "Create repository" button.
5. On the next page, click the link that says "uploading an existing file"
   (it's in the line: "...or push an existing repository / uploading an existing file").
6. Open your "plate-lookup" folder in another window. Select everything INSIDE it
   (the file server.js, package.json, render.yaml, settings.txt, and the "public"
   folder) and drag them onto the GitHub upload area.
   IMPORTANT: drag the items from *inside* the folder, not the folder itself, so
   that "server.js" sits at the top level.
7. Wait for them to finish uploading (you'll see them listed), then scroll down and
   click the green "Commit changes" button.

Your files now live on GitHub.

------------------------------------------------------------
PART C — Connect Render and get your link
------------------------------------------------------------

8. Go to  render.com  and click "Get Started". Choose "Sign in with GitHub" — this
   links the two accounts. Approve the access it asks for.
9. In the Render dashboard click "New +" (top right), then "Web Service".
10. Find and select your "plate-lookup" repository. Click "Connect".
    (If asked, give Render permission to see the repo.)
11. Render reads the included render.yaml and fills most settings in automatically.
    Just check:
       - Instance type / plan:  Free
       - Build command:  npm install
       - Start command:  npm start
12. Click "Create Web Service" (or "Deploy"). Render now builds it — this takes a
    few minutes. When it's done you'll see a link near the top like:
       https://plate-lookup.onrender.com
13. Click that link. The app opens. Type DXB / F / 33333 — you'll see the sample
    Hyundai Santa Fe. THIS LINK is what you send your colleague.

------------------------------------------------------------
PART D — Switch the online app to the REAL service
------------------------------------------------------------

Do this once you have your carregistrationapi.ae username (see the main README,
Part 4, steps 13-14 for getting the free account).

14. In Render, open your plate-lookup service, then click "Environment" in the
    left menu.
15. Click "Add Environment Variable" and add:
       Key:  REGCHECK_USERNAME      Value:  your username
16. Find the MODE variable (already there) and change its Value from "mock" to "live".
17. Click "Save Changes". Render restarts the app automatically (about a minute).
18. Open your onrender.com link, type DXB / F / 33333 — you'll get a real car for
    free (test plate). A real Dubai plate then uses 1 of your credits.

Your colleague keeps using the same link the whole time — you just flipped what's
behind it.

------------------------------------------------------------
GOOD TO KNOW
------------------------------------------------------------

- Free Render apps "go to sleep" after a while unused. The first time your colleague
  opens the link after a quiet period, it may take 30-60 seconds to wake up, then
  it's fast. That's normal on the free plan.
- To change anything later, you edit the file on GitHub (or re-upload), and Render
  updates the live link automatically.
- Your username is only in Render's private Environment settings — never in GitHub,
  never in the link, never visible to your colleague.
