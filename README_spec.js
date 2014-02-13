describe("literate-jasmine", function() {
  describe("mathematics", function() {
    it("add can add numbers", function() {
    var a = 1,
        b = 2;
    
    console.log(a, b, a + b);
    
    expect(a + b).toBe(3);
    });
  });
});
