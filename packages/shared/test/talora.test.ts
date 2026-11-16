import { describe, it, expect } from "vitest";
import { placementNext, scoreTest, isPass, unitState, weakTopics, winner, computerMove, checkGoes, checkContinuous, Cell } from "../src";
describe("placement", () => {
  it("A1 gets the full pathway with no test", () => expect(placementNext("A1", {})).toEqual({ done: true, start: "A1" }));
  it("B1 must take the B1 test first", () => expect(placementNext("B1", {})).toEqual({ done: false, test: "B1" }));
  it("pass keeps the selected level", () => expect(placementNext("B1", { B1: 80 })).toEqual({ done: true, start: "B1" }));
  it("fail walks down, then lands on A1", () => { expect(placementNext("B1", { B1: 40 })).toEqual({ done: false, test: "A2" }); expect(placementNext("B1", { B1: 40, A2: 70 })).toEqual({ done: true, start: "A1" }); expect(placementNext("C1", { C1: 20, B2: 90 })).toEqual({ done: true, start: "B2" }); });
});
describe("assessment", () => {
  it("80% pass mark", () => { expect(scoreTest(4, 5).passed).toBe(true); expect(scoreTest(3, 5).passed).toBe(false); expect(isPass(75)).toBe(false); expect(scoreTest(5, 6).passed).toBe(true); });
  it("weak topics are unique", () => expect(weakTopics(["a", "b", "c"], { a: "x", b: "x", c: "y" })).toEqual(["x", "y"]));
  it("unlock chain: lessons -> tests -> mega -> complete", () => {
    const L = ["l1", "l2"];
    expect(unitState("u", [], ["l1"], L).testsOpen).toBe(false);
    expect(unitState("u", ["u-t1", "u-t2"], L, L).megaUnlocked).toBe(false);
    expect(unitState("u", ["u-t1", "u-t2", "u-t3"], L, L).megaUnlocked).toBe(true);
    expect(unitState("u", ["u-t1", "u-t2", "u-t3"], ["l1"], L).megaUnlocked).toBe(false);
    expect(unitState("u", ["u-t1", "u-t2", "u-t3", "u-mega"], L, L).complete).toBe(true);
  });
});
describe("tic-tac-toe", () => {
  const e = (): Cell[] => Array(9).fill(null);
  it("detects wins and draws", () => { const b = e(); b[0] = b[1] = b[2] = "X"; expect(winner(b)).toBe("X"); expect(winner(["X","O","X","X","O","O","O","X","X"])).toBe("draw"); });
  it("medium wins and blocks", () => { const w = e(); w[0] = w[1] = "O"; w[3] = w[4] = "X"; expect(computerMove(w, "medium")).toBe(2); const k = e(); k[0] = k[1] = "X"; k[4] = "O"; expect(computerMove(k, "medium")).toBe(2); });
  it("hard never loses against random play", () => { for (let g = 0; g < 200; g++) { let b = e(), turn: "X" | "O" = "X"; while (!winner(b)) { const f = b.flatMap((c, i) => (c ? [] : [i])); const m = turn === "X" ? f[Math.floor(Math.random() * f.length)] : computerMove(b, "hard"); b[m] = turn; turn = turn === "X" ? "O" : "X"; } expect(winner(b)).not.toBe("X"); } });
});
describe("sentence checks", () => {
  it("goes rule", () => { expect(checkGoes("Ali goes to school.").ok).toBe(true); expect(checkGoes("Ali go to school.").msg).toContain("goes"); expect(checkGoes("I goes to school.").ok).toBe(false); expect(checkGoes("ali goes to school.").ok).toBe(false); });
  it("is + verb-ing rule", () => { expect(checkContinuous("She is cooking.").ok).toBe(true); expect(checkContinuous("I is studying.").msg).toContain("am"); expect(checkContinuous("They are play.").ok).toBe(false); });
});
