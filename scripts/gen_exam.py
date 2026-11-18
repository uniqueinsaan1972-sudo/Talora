"""Authoring + generator for the TALORA Mega Test bank. Writes content/src/exam_bank.json (with answers, never shipped to the browser),
content/exam_bank.public.json (no answers) and supabase/migrations/0007_seed_exam.sql (answer keys). Run from project root.
Urdu/Hindi in translation questions are drafts needing native review."""
import json
q = lambda s: "'" + s.replace("'", "''") + "'"
def M(l, c, p, o, a, **k): return dict(level=l, category=c, type="mcq", prompt=p, options=o, answers=[a], **k)
def A(l, p, w, a): return dict(level=l, category="sentence", type="arrange", prompt=p, words=w, answers=a)
def T(l, r, u, h, o): return M(l, "translation", "Choose the correct English sentence.", o, o[0], src={"roman_urdu": r, "urdu": u, "hindi": h})
B = [
 M(0,"vocabulary","What is the opposite of “hot”?",["cold","big","fast"],"cold"), M(0,"vocabulary","I drink ___ every morning.",["water","chair","door"],"water"),
 M(0,"grammar","She ___ a student.",["am","is","are"],"is"), M(0,"grammar","I ___ from Pakistan.",["is","are","am"],"am"), A(0,"Make a sentence.",["is","name","My","Ali"],["My name is Ali"]),
 T(0,"Main school jata hoon.","میں اسکول جاتا ہوں۔","मैं स्कूल जाता हूँ।",["I go to school.","I goes to school.","I am school."]),
 M(0,"spelling","Choose the correct spelling.",["freind","friend","frend"],"friend"), M(0,"reading","Where does the cat sleep?",["on the sofa","in the garden","on the bed"],"on the sofa",context="Sara has a cat. The cat is white. It sleeps on the sofa."),
 M(1,"vocabulary","“Delicious” means:",["very tasty","very old","very small"],"very tasty"), M(1,"vocabulary","Where can you buy medicine?",["pharmacy","library","stadium"],"pharmacy"),
 M(1,"grammar","He ___ football yesterday.",["play","played","plays"],"played"), M(1,"grammar","There ___ two books on the table.",["is","are","am"],"are"), A(1,"Make a question.",["you","are","going","Where"],["Where are you going"]),
 T(1,"Kal main bazaar gaya tha.","کل میں بازار گیا تھا۔","कल मैं बाज़ार गया था।",["I went to the market yesterday.","I go to the market tomorrow.","I am going market yesterday."]),
 M(1,"spelling","Choose the correct spelling.",["beautifull","beautiful","beutiful"],"beautiful"), M(1,"listening","What does the speaker want?",["Someone to wait","Someone to run","Someone to leave"],"Someone to wait",audio="I am running late. Please wait for me."),
 M(2,"vocabulary","“I will figure it out” means:",["I will find a solution","I will draw a figure","I will leave it"],"I will find a solution"), M(2,"vocabulary","Which word means “to make something better”?",["improve","ignore","destroy"],"improve"),
 M(2,"grammar","If I ___ more time, I would learn French.",["have","had","will have"],"had"), M(2,"grammar","She has lived here ___ 2020.",["for","since","ago"],"since"), A(2,"Make a question.",["Have","you","been","waiting","long"],["Have you been waiting long"]),
 T(2,"Agar baarish hui to hum ghar par rahenge.","اگر بارش ہوئی تو ہم گھر پر رہیں گے۔","अगर बारिश हुई तो हम घर पर रहेंगे।",["If it rains, we will stay at home.","If it will rain, we stay at home.","If it rained, we will stayed home."]),
 M(2,"spelling","Choose the correct spelling.",["necessary","neccessary","necesary"],"necessary"), M(2,"reading","When does Ahmed play cricket?",["every morning","on Fridays","at six"],"on Fridays",context="Ahmed wakes up at six every day. He prays, has breakfast and takes the bus to college. On Fridays he finishes early and plays cricket with his friends."),
 M(3,"vocabulary","“It depends” is used when:",["the answer is not simple","you agree completely","you are leaving"],"the answer is not simple"), M(3,"vocabulary","Which word is closest in meaning to “reluctant”?",["unwilling","eager","careless"],"unwilling"),
 M(3,"grammar","By the time we arrived, the film ___.",["started","had started","has started"],"had started"), M(3,"grammar","The report ___ by the manager yesterday.",["was written","wrote","is writing"],"was written"), A(3,"Make a sentence.",["Despite","the","rain","we","went","out"],["Despite the rain we went out","We went out despite the rain"]),
 T(3,"Agar mujhe pata hota to main tumhein bata deta.","اگر مجھے معلوم ہوتا تو میں تمہیں بتا دیتا۔","अगर मुझे पता होता तो मैं तुम्हें बता देता।",["If I had known, I would have told you.","If I knew, I would told you.","If I have known, I will tell you."]),
 M(3,"spelling","Choose the correct spelling.",["accommodation","accomodation","acommodation"],"accommodation"), M(3,"listening","When is the report needed?",["by Friday afternoon","on Friday morning","next week"],"by Friday afternoon",audio="Could you send me the report by Friday afternoon?"),
 M(4,"vocabulary","“Meticulous” means:",["very careful about details","very noisy","very lazy"],"very careful about details"), M(4,"vocabulary","The company’s profits ___ sharply last year.",["plummeted","whispered","borrowed"],"plummeted"),
 M(4,"grammar","Hardly ___ the office when it started to rain.",["had he left","he had left","did he left"],"had he left"), M(4,"grammar","I wish I ___ harder when I was at school.",["studied","had studied","would study"],"had studied"), A(4,"Make a sentence.",["Rarely","do","we","eat","out"],["Rarely do we eat out"]),
 T(4,"Is masle ko jald az jald hal karna zaroori hai.","اس مسئلے کو جلد از جلد حل کرنا ضروری ہے۔","इस समस्या को जल्द से जल्द हल करना ज़रूरी है।",["It is essential to solve this problem as soon as possible.","This problem solves essential soon.","It is essentially solved problem quick."]),
 M(4,"spelling","Choose the correct spelling.",["conscientious","consciencious","conscientous"],"conscientious"), M(4,"reading","What challenge do managers mention?",["building team trust","finding office space","paying higher taxes"],"building team trust",context="Remote work has changed how companies hire. Employers can now choose from candidates in different countries, but managers say that building team trust takes more effort when people rarely meet."),
 M(5,"vocabulary","“Ubiquitous” means:",["found everywhere","very rare","very expensive"],"found everywhere"), M(5,"vocabulary","“To mitigate a risk” means to:",["reduce its effect","increase it","ignore it"],"reduce its effect"),
 M(5,"grammar","Were it not for your help, we ___ the deadline.",["would have missed","will miss","missed"],"would have missed"), M(5,"grammar","She suggested that he ___ a doctor.",["sees","see","saw"],"see"), A(5,"Make a sentence.",["Had","I","known","I","would","have","called"],["Had I known I would have called"]),
 T(5,"Is faisle ke nataij door-ras honge.","اس فیصلے کے نتائج دور رس ہوں گے۔","इस फैसले के नतीजे दूरगामी होंगे।",["The consequences of this decision will be far-reaching.","This decision results are far going.","The decision’s consequence will far reach."]),
 M(5,"spelling","Choose the correct spelling.",["bureaucracy","beaurocracy","burocracy"],"bureaucracy"), M(5,"listening","What will happen if costs are not reduced?",["targets will be hard to meet","costs will fall","the quarter will end early"],"targets will be hard to meet",audio="Unless we reduce costs this quarter, we will struggle to meet our targets."),
]
for i, x in enumerate(B, 1): x["id"] = f"x{x['level']}-{sum(1 for y in B[:i] if y['level'] == x['level'])}"
for x in B:
    if x["type"] == "mcq": assert x["answers"][0] in x["options"], x["id"]
    if x["type"] == "arrange": assert all(sorted(a.lower().split()) == sorted(w.lower() for w in x["words"]) for a in x["answers"]), x["id"]
assert len({x["id"] for x in B}) == len(B) == 48
json.dump({"questions": B}, open("content/src/exam_bank.json", "w"), indent=1, ensure_ascii=False)
json.dump({"questions": [{k: v for k, v in x.items() if k != "answers"} for x in B]}, open("content/exam_bank.public.json", "w"), indent=1, ensure_ascii=False)
sql = ["-- GENERATED by scripts/gen_exam.py. Do not edit by hand."] + [f"insert into exam_keys(question_id,category,level,answer) values ({q(x['id'])},{q(x['category'])},{x['level']},{q(a)}) on conflict do nothing;" for x in B for a in x["answers"]]
open("supabase/migrations/0007_seed_exam.sql", "w").write("\n".join(sql) + "\n")
print(len(B), "questions")
