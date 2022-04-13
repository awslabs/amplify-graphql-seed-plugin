import { Seeder } from "../utils/seeder";

it("Check if compiles", () => {
    const seeder = new Seeder("message")
    seeder.greet()
});