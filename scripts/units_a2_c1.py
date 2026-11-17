"""Authoring script for units A2-C1. Writes content/<id>_lessons.json and content/src/<id>_tests.json.
Then run scripts/gen_tests.py. Urdu/Hindi are drafts that need native review."""
import json
T = lambda r, u, h: {"roman_urdu": r, "urdu": u, "hindi": h}
SUBJ = T("Subject (kaam karne wala)", "Subject (کام کرنے والا)", "Subject (काम करने वाला)"); OBJ = T("Object (cheez)", "Object (چیز)", "Object (चीज़)")
TIME = T("Waqt", "وقت", "समय"); HELP = T("Helping verb", "Helping verb", "Helping verb"); PP = T("Past participle (verb ka teesra form)", "Past participle (verb کی تیسری شکل)", "Past participle (verb का तीसरा रूप)")
PV = T("Verb (guzra hua waqt, -ed)", "Verb (گزرا ہوا وقت، -ed)", "Verb (बीता हुआ समय, -ed)")
LATER = T("Baad mein hone wala kaam (simple past)", "بعد میں ہونے والا کام (simple past)", "बाद में होने वाला काम (simple past)")
HELP2 = T("Helping verbs (will have)", "Helping verbs (will have)", "Helping verbs (will have)")
def ex(en, r, u, h): return {"en": en, "tr": T(r, u, h)}
L = {
"a2-u1": dict(title="Dagoruna's Yesterday", lid="a2-u1-l1", ltitle="Dagoruna Played Yesterday", pose="running", sentence="Dagoruna played football yesterday.", practice="past",
 tr=T("Dagoruna ne kal football khela.", "ڈیگورونا نے کل فٹ بال کھیلا۔", "डेगोरुना ने कल फुटबॉल खेला।"),
 parts=[("Dagoruna", SUBJ), ("played", PV), ("football", OBJ), ("yesterday", TIME)],
 why=T("Guzre hue waqt ke kaam ke liye past simple use hota hai. Regular verbs mein -ed lagta hai (play se played). Kuch verbs ki shakal badal jati hai (go se went, eat se ate). Negative aur sawal mein did use hota hai, aur verb apni asal shakal mein rehta hai (did not go).",
  "گزرے ہوئے وقت کے کام کے لیے past simple استعمال ہوتا ہے۔ Regular verbs میں ed لگتا ہے (play سے played)۔ کچھ verbs کی شکل بدل جاتی ہے (go سے went، eat سے ate)۔ Negative اور سوال میں did آتا ہے اور verb اپنی اصل شکل میں رہتا ہے (did not go)۔",
  "बीते हुए समय के काम के लिए past simple इस्तेमाल होता है। Regular verbs में ed लगता है (play से played)। कुछ verbs का रूप बदल जाता है (go से went, eat से ate)। Negative और सवाल में did आता है और verb अपने मूल रूप में रहता है (did not go)।"),
 examples=[ex("I watched a film last night.", "Maine kal raat film dekhi.", "میں نے کل رات فلم دیکھی۔", "मैंने कल रात फिल्म देखी।"), ex("She went to the market.", "Wo bazaar gayi.", "وہ بازار گئی۔", "वह बाज़ार गई।"), ex("We ate rice.", "Humne chawal khaye.", "ہم نے چاول کھائے۔", "हमने चावल खाए।")],
 prompt="Now write your own sentence about yesterday, for example: I watched a film last night.",
 tests=[("Test 1: regular verbs (-ed)", "Regular past (-ed)", [
  ("m", "Dagoruna ___ football yesterday.", ["play", "played", "playing"], ["played"]), ("f", "I ___ English last night. (study)", ["studied"]),
  ("m", "Which is the past of “walk”?", ["walked", "walking", "walks"], ["walked"]), ("a", ["watched", "We", "a", "film"], ["We watched a film"]),
  ("m", "She ___ the door a minute ago.", ["open", "opened", "opens"], ["opened"])]),
 ("Test 2: irregular verbs", "Irregular past", [
  ("f", "He ___ to school by bus yesterday. (go)", ["went"]), ("m", "Past of “eat”?", ["ate", "eated", "eaten"], ["ate"]), ("f", "We ___ a movie last week. (see)", ["saw"]),
  ("a", ["bought", "She", "a", "book"], ["She bought a book"]), ("m", "I ___ breakfast at 7 am this morning.", ["have", "had", "has"], ["had"])]),
 ("Test 3: did, negatives, questions", "Past negatives and questions", [
  ("m", "I ___ go to school yesterday.", ["didn't", "don't", "not"], ["didn't"]), ("f", "___ you watch TV last night? (Do / Did)", ["Did"]), ("m", "She didn't ___ the homework.", ["do", "did", "done"], ["do"]),
  ("a", ["Did", "you", "sleep", "well"], ["Did you sleep well"]), ("m", "Which sentence is correct?", ["He didn't went home.", "He didn't go home."], ["He didn't go home."])])],
 mega=[("m", "“Dagoruna ne kal football khela.” means:", ["Dagoruna played football yesterday.", "Dagoruna plays football yesterday.", "Dagoruna play football tomorrow."], ["Dagoruna played football yesterday."], "Regular past (-ed)"),
  ("f", "They ___ pizza last night. (eat)", ["ate"], "Irregular past"), ("m", "Which sentence is correct?", ["She goed home.", "She went home."], ["She went home."], "Irregular past"),
  ("f", "He ___ not call me yesterday. (do / did)", ["did"], "Past negatives and questions"), ("a", ["last", "I", "Sunday", "visited", "my", "uncle"], ["I visited my uncle last Sunday", "Last Sunday I visited my uncle"], "Regular past (-ed)"),
  ("m", "Past of “make”?", ["maked", "made", "making"], ["made"], "Irregular past")]),
"b1-u1": dict(title="Homework Done!", lid="b1-u1-l1", ltitle="Dagoruna Has Finished His Homework", pose="happy", sentence="Dagoruna has finished his homework.", practice="perfect",
 tr=T("Dagoruna ne apna homework khatam kar liya hai.", "ڈیگورونا نے اپنا ہوم ورک ختم کر لیا ہے۔", "डेगोरुना ने अपना होमवर्क खत्म कर लिया है।"),
 parts=[("Dagoruna", SUBJ), ("has", HELP), ("finished", PP), ("his homework", OBJ)],
 why=T("Present perfect (have/has + past participle) tab use hota hai jab guzra hua kaam ab bhi hamare liye ahem ho, ya jab waqt bataya na gaya ho. I/you/we/they ke saath have, he/she/it/naam ke saath has aata hai. Ye words aksar saath aate hain: for, since, already, never, ever, just.",
  "Present perfect (have/has + past participle) تب استعمال ہوتا ہے جب گزرا ہوا کام اب بھی ہمارے لیے اہم ہو، یا جب وقت نہ بتایا گیا ہو۔ I/you/we/they کے ساتھ have اور he/she/it/نام کے ساتھ has آتا ہے۔ یہ الفاظ اکثر ساتھ آتے ہیں: for، since، already، never، ever، just۔",
  "Present perfect (have/has + past participle) तब इस्तेमाल होता है जब बीता हुआ काम अब भी हमारे लिए अहम हो, या जब समय न बताया गया हो। I/you/we/they के साथ have और he/she/it/नाम के साथ has आता है। ये शब्द अक्सर साथ आते हैं: for, since, already, never, ever, just।"),
 examples=[ex("I have lived here for five years.", "Main yahan paanch saal se reh raha hoon.", "میں یہاں پانچ سال سے رہ رہا ہوں۔", "मैं यहाँ पाँच साल से रह रहा हूँ।"), ex("She has never visited London.", "Wo kabhi London nahi gayi.", "وہ کبھی لندن نہیں گئی۔", "वह कभी लंदन नहीं गई।"), ex("We have already eaten.", "Hum pehle hi kha chuke hain.", "ہم پہلے ہی کھا چکے ہیں۔", "हम पहले ही खा चुके हैं।")],
 prompt="Now write your own sentence, for example: I have already finished my work.",
 tests=[("Test 1: have / has + past participle", "have/has + past participle", [
  ("m", "Dagoruna ___ finished his homework.", ["have", "has", "had"], ["has"]), ("f", "I ___ seen that film. (have / has)", ["have"]), ("m", "Past participle of “write”?", ["wrote", "written", "writing"], ["written"]),
  ("a", ["have", "They", "arrived"], ["They have arrived"]), ("m", "She ___ lived here for five years.", ["have", "has", "is"], ["has"])]),
 ("Test 2: for, since, already, never, ever", "for / since / already / never", [
  ("m", "I have lived here ___ 2019.", ["for", "since", "during"], ["since"]), ("m", "We have known him ___ ten years.", ["for", "since", "from"], ["for"]),
  ("f", "She has ___ been to Paris, so she wants to go. (never / ago)", ["never"]), ("m", "I have ___ finished my work. It is done.", ["already", "yesterday", "last night"], ["already"]), ("f", "Have you ___ been to Karachi? (ever / ago)", ["ever"])]),
 ("Test 3: present perfect or past simple?", "Present perfect vs past simple", [
  ("m", "I ___ him yesterday.", ["have seen", "saw"], ["saw"]), ("m", "I ___ him already.", ["saw", "have seen"], ["have seen"]), ("f", "She ___ to Lahore in 2020. (go)", ["went"]),
  ("m", "Which is correct?", ["I have eaten dinner last night.", "I ate dinner last night."], ["I ate dinner last night."]), ("m", "Which is correct?", ["We have just arrived.", "We have just arrive."], ["We have just arrived."])])],
 mega=[("m", "“Maine apna kaam khatam kar liya hai.” means:", ["I have finished my work.", "I finished my work yesterday.", "I am finish my work."], ["I have finished my work."], "have/has + past participle"),
  ("f", "He ___ never eaten sushi. (have / has)", ["has"], "have/has + past participle"), ("m", "I ___ in this city since 2015.", ["live", "lived", "have lived"], ["have lived"], "for / since / already / never"),
  ("f", "They have ___ the report. (write)", ["written"], "have/has + past participle"), ("a", ["has", "She", "already", "left"], ["She has already left", "She has left already"], "for / since / already / never"),
  ("m", "Which is correct?", ["She has went home.", "She has gone home."], ["She has gone home."], "have/has + past participle")]),
"b2-u1": dict(title="Before the Teacher Came", lid="b2-u1-l1", ltitle="Dagoruna Had Already Finished", pose="thinking", sentence="Dagoruna had finished before the teacher arrived.", practice="pastperfect",
 tr=T("Teacher ke aane se pehle Dagoruna kaam khatam kar chuka tha.", "استاد کے آنے سے پہلے ڈیگورونا کام ختم کر چکا تھا۔", "शिक्षक के आने से पहले डेगोरुना काम खत्म कर चुका था।"),
 parts=[("Dagoruna", SUBJ), ("had", HELP), ("finished", PP), ("before the teacher arrived", LATER)],
 why=T("Past perfect (had + past participle) do guzre hue kaamon mein se pehle hone wale kaam ke liye use hota hai. Baad wala kaam simple past mein hota hai. Is mein had sab ke saath aata hai (I had, she had, they had).",
  "Past perfect (had + past participle) دو گزرے ہوئے کاموں میں سے پہلے ہونے والے کام کے لیے استعمال ہوتا ہے۔ بعد والا کام simple past میں ہوتا ہے۔ اس میں had سب کے ساتھ آتا ہے (I had، she had، they had)۔",
  "Past perfect (had + past participle) दो बीते हुए कामों में से पहले होने वाले काम के लिए इस्तेमाल होता है। बाद वाला काम simple past में होता है। इसमें had सब के साथ आता है (I had, she had, they had)।"),
 examples=[ex("When I reached the station, the train had left.", "Jab main station pahuncha, train ja chuki thi.", "جب میں اسٹیشن پہنچا تو ٹرین جا چکی تھی۔", "जब मैं स्टेशन पहुँचा, तो ट्रेन जा चुकी थी।"), ex("She had already eaten when we arrived.", "Hamare pahunchne se pehle wo kha chuki thi.", "ہمارے پہنچنے سے پہلے وہ کھا چکی تھی۔", "हमारे पहुँचने से पहले वह खा चुकी थी।"), ex("He said he had seen the film.", "Usne kaha ke usne film dekh rakhi thi.", "اس نے کہا کہ اس نے فلم دیکھ رکھی تھی۔", "उसने कहा कि उसने फिल्म देख रखी थी।")],
 prompt="Now write your own sentence, for example: She had already left when I called.",
 tests=[("Test 1: had + past participle", "had + past participle", [
  ("m", "Dagoruna ___ finished before the teacher arrived.", ["has", "had", "have"], ["had"]), ("f", "She ___ already eaten when we arrived. (had / has)", ["had"]), ("m", "Past participle of “leave”?", ["left", "leaved", "leaving"], ["left"]),
  ("a", ["had", "He", "left", "already"], ["He had already left", "He had left already"], ), ("m", "By the time I got there, the film ___.", ["started", "had started", "has started"], ["had started"])]),
 ("Test 2: which happened first?", "Earlier vs later past events", [
  ("m", "When I reached the station, the train ___.", ["left", "had left", "leaves"], ["had left"]), ("m", "In “She had cooked before he came”, which happened first?", ["She cooked", "He came"], ["She cooked"]),
  ("f", "He said that he ___ seen the film. (had / has)", ["had"]), ("m", "I was tired because I ___ all night.", ["worked", "had worked", "work"], ["had worked"]), ("f", "After they ___ dinner, they watched TV. (had + eat)", ["had eaten", "eaten"])]),
 ("Test 3: past perfect or past simple?", "Past perfect vs past simple", [
  ("m", "I ___ never seen snow before I moved to Canada.", ["had", "have", "was"], ["had"]), ("m", "She ___ to the shop, then she came home.", ["went", "had gone"], ["went"]), ("f", "He was nervous because he ___ never flown before. (had / has)", ["had"]),
  ("m", "Which is correct?", ["They had arrive.", "They had arrived."], ["They had arrived."]), ("m", "We were late. The meeting ___ already started.", ["has", "had", "have"], ["had"])])],
 mega=[("m", "“Teacher ke aane se pehle Dagoruna kaam khatam kar chuka tha.” means:", ["Dagoruna had finished before the teacher arrived.", "Dagoruna has finished before the teacher arrives.", "Dagoruna finishes before the teacher arrived."], ["Dagoruna had finished before the teacher arrived."], "had + past participle"),
  ("f", "She ___ left before I called. (had / has)", ["had"], "had + past participle"), ("m", "Which is correct?", ["He had went home.", "He had gone home."], ["He had gone home."], "had + past participle"),
  ("f", "They had ___ the work before noon. (finish)", ["finished"], "Earlier vs later past events"), ("a", ["had", "I", "eaten", "already"], ["I had already eaten", "I had eaten already"], "had + past participle"),
  ("m", "Which happened first? “I had paid before he asked.”", ["I paid", "He asked"], ["I paid"], "Earlier vs later past events")]),
"c1-u1": dict(title="Goals and Deadlines", lid="c1-u1-l1", ltitle="Dagoruna Will Have Completed the Course", pose="reading", sentence="By next June, Dagoruna will have completed the course.", practice="futureperfect",
 tr=T("Agle June tak Dagoruna course mukammal kar chuka hoga.", "اگلے جون تک ڈیگورونا کورس مکمل کر چکا ہوگا۔", "अगले जून तक डेगोरुना कोर्स पूरा कर चुका होगा।"),
 parts=[("By next June", TIME), ("Dagoruna", SUBJ), ("will have", HELP2), ("completed", PP), ("the course", OBJ)],
 why=T("Future perfect (will have + past participle) us kaam ke liye hai jo kisi muqarrar future waqt se pehle mukammal ho chuka hoga. Ye aksar by + waqt ke saath aata hai (by Friday, by 2030) aur daftar ki baat cheet mein targets aur deadlines ke liye aam hai. Will have sab ke saath same rehta hai.",
  "Future perfect (will have + past participle) اس کام کے لیے ہے جو کسی مقررہ مستقبل کے وقت سے پہلے مکمل ہو چکا ہوگا۔ یہ اکثر by + وقت کے ساتھ آتا ہے (by Friday، by 2030) اور دفتر کی بات چیت میں ٹارگٹس اور ڈیڈ لائنز کے لیے عام ہے۔ Will have سب کے ساتھ ایک جیسا رہتا ہے۔",
  "Future perfect (will have + past participle) उस काम के लिए है जो किसी तय भविष्य के समय से पहले पूरा हो चुका होगा। यह अक्सर by + समय के साथ आता है (by Friday, by 2030) और दफ़्तर की बातचीत में टारगेट और डेडलाइन के लिए आम है। Will have सब के साथ एक जैसा रहता है।"),
 examples=[ex("By 2030, I will have finished my degree.", "2030 tak main apni degree mukammal kar chuka hounga.", "۲۰۳۰ تک میں اپنی ڈگری مکمل کر چکا ہوں گا۔", "2030 तक मैं अपनी डिग्री पूरी कर चुका होऊँगा।"), ex("She will have left by the time you arrive.", "Jab tak aap pahunchein gay wo ja chuki hogi.", "جب تک آپ پہنچیں گے وہ جا چکی ہوگی۔", "जब तक आप पहुँचेंगे वह जा चुकी होगी।"), ex("They will have signed the contract before Friday.", "Wo Jumay se pehle contract par dastkhat kar chuke honge.", "وہ جمعے سے پہلے معاہدے پر دستخط کر چکے ہوں گے۔", "वे शुक्रवार से पहले अनुबंध पर हस्ताक्षर कर चुके होंगे।")],
 prompt="Now write your own sentence, for example: By Friday, we will have sent the report.",
 tests=[("Test 1: will have + past participle", "will have + past participle", [
  ("m", "By next June, Dagoruna ___ the course.", ["will complete", "will have completed", "completes"], ["will have completed"]), ("f", "By 2030, I ___ finished my degree. (will have / will)", ["will have"]),
  ("m", "Past participle of “submit”?", ["submitted", "submit", "submitting"], ["submitted"]), ("a", ["will", "She", "have", "left"], ["She will have left"]), ("m", "They ___ the contract before Friday.", ["will have signed", "sign", "signed"], ["will have signed"])]),
 ("Test 2: by + time", "By + time", [
  ("m", "We ___ the report by 5 pm.", ["will have finished", "finished", "are finishing"], ["will have finished"]), ("m", "Which word often goes with the future perfect?", ["by", "ago", "yesterday"], ["by"]),
  ("f", "By the time you arrive, I ___ cooked dinner. (will have / have)", ["will have"]), ("m", "By next year, he ___ here for ten years.", ["will work", "will have worked", "works"], ["will have worked"]), ("f", "She will have ___ before you come. (leave)", ["left"])]),
 ("Test 3: professional English", "Future perfect at work", [
  ("m", "By the end of the quarter, the team ___ all its targets.", ["will have met", "met", "meets"], ["will have met"]), ("m", "Which sentence is correct?", ["The manager will has approved it.", "The manager will have approved it."], ["The manager will have approved it."]),
  ("f", "By Monday, we ___ sent all invoices. (will have / has)", ["will have"]), ("m", "By the time the meeting starts, I ___ the slides.", ["will prepare", "will have prepared", "prepared"], ["will have prepared"]),
  ("a", ["will", "They", "have", "finished", "by", "noon"], ["They will have finished by noon", "By noon they will have finished"])])],
 mega=[("m", "“Agle June tak Dagoruna course mukammal kar chuka hoga.” means:", ["By next June, Dagoruna will have completed the course.", "Next June Dagoruna completes the course.", "Dagoruna had completed the course next June."], ["By next June, Dagoruna will have completed the course."], "will have + past participle"),
  ("f", "By 5 pm, she ___ left the office. (will have / had)", ["will have"], "By + time"), ("m", "Which is correct?", ["We will have finish by Friday.", "We will have finished by Friday."], ["We will have finished by Friday."], "will have + past participle"),
  ("f", "By next month, I will have ___ my report. (submit)", ["submitted"], "Future perfect at work"), ("m", "Which tense is “will have + past participle”?", ["Future Perfect", "Future Simple", "Past Perfect"], ["Future Perfect"], "will have + past participle"),
  ("a", ["will", "He", "have", "retired", "by", "2035"], ["He will have retired by 2035", "By 2035 he will have retired"], "By + time")]),
}
ORDER = ["a1-u1", "a2-u1", "b1-u1", "b2-u1", "c1-u1"]
for uid, d in L.items():
    prev = ORDER[ORDER.index(uid) - 1]; tests = []
    def conv(q, tid, n, topic):
        k, *r = q; o = {"id": f"{tid}-q{n}", "topic": topic}
        if k == "m": o.update(type="mcq", prompt=r[0], options=r[1], answers=r[2])
        elif k == "f": o.update(type="fill", prompt=r[0], answers=r[1])
        else: o.update(type="arrange", prompt="Make a sentence.", words=r[0], answers=r[1])
        return o
    for n, (title, topic, qs) in enumerate(d["tests"], 1):
        tid = f"{uid}-t{n}"; t = {"id": tid, "title": title, "xp": 10, "questions": [conv(q, tid, i, topic) for i, q in enumerate(qs, 1)]}
        if n == 1: t["requires"] = [prev + "-mega"]
        tests.append(t)
    mid = f"{uid}-mega"; tests.append({"id": mid, "title": "Mega Test", "kind": "mega", "xp": 30, "requires": [f"{uid}-t{i}" for i in (1, 2, 3)], "questions": [conv(q[:-1], mid, i, q[-1]) for i, q in enumerate(d["mega"], 1)]})
    json.dump({"unit": uid, "tests": tests}, open(f"content/src/{uid.replace('-', '_')}_tests.json", "w"), indent=1, ensure_ascii=False)
    json.dump({"_note": "Urdu and Hindi are drafts: native-speaker review needed.", "unit": uid, "title": d["title"], "lessons": [{"id": d["lid"], "title": d["ltitle"], "pose": d["pose"], "sentence": d["sentence"], "tr": d["tr"], "parts": [{"w": w, "r": r} for w, r in d["parts"]], "why": d["why"], "examples": d["examples"], "practice": d["practice"], "prompt": d["prompt"]}]},
              open(f"content/{uid.replace('-', '_')}_lessons.json", "w"), indent=1, ensure_ascii=False)
