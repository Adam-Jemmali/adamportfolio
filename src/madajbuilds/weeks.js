// The Build Log — per issue quiz + implementation plan.
//
// Each issue's email links to /madajbuilds/?w=<n>, which opens the
// interactive version of that issue's quiz. Keep `correct` and `why`
// in sync with what the email actually taught that week.

export const BUILDLOG_NAME = "The Build Log";

export const WEEKS = {
    1: {
        n: 1,
        title: "Two sites, one day, plenty of wreckage",
        questions: [
            {
                q: "You paste a secret key somewhere it might have been exposed for four minutes. Rotating it takes ninety seconds. What do you do?",
                options: [
                    "Rotate it. The cost never gets closer to the cost of an incident.",
                    "Leave it. The realistic risk is close to zero.",
                    "Wait a day and rotate only if something looks off.",
                ],
                correct: 0,
                why: "The moment you are calculating whether it is probably fine, you already have your answer.",
            },
            {
                q: "Your build works locally but visitors see a blank screen. Most likely first suspect?",
                options: [
                    "The framework is broken",
                    "Something is painting on top of everything from the first frame",
                    "The user's browser is out of date",
                ],
                correct: 1,
                why: "A title card, overlay, or full bleed element sitting at z top will hide a working page. Check what renders last.",
            },
            {
                q: "The best reason to build the forty second thing nobody asked for?",
                options: [
                    "It ranks well on search",
                    "Nobody asked for it is usually the reason a thing gets remembered",
                    "It is quick to make",
                ],
                correct: 1,
                why: "Effort where it is not expected is what people bring up later.",
            },
        ],
        planPrompt: "One thing you have been putting off. Name it, and the day you start.",
    },
};

export const getWeek = (raw) => {
    const n = Number(raw);
    return Number.isInteger(n) && WEEKS[n] ? WEEKS[n] : null;
};
