describe("literate-jasmine ", function() {
  describe("Mathematics", function() {
    it("add can add numbers", function() {
      var a = 1,
          b = 2;
      
      console.log(a, b, a + b);
      
      expect(a + b).toBe(3);
    });
    it("can divide numbers", function() {
      var a = 6,
          b = 2;
      expect(a/b).toBe(3);
    });
    it("appending works with +", function() {
      var text = "abc";
      
      expect(text + "d").toBe("abcd");
    });
  });
  describe("Strings", function() {
    it("appending works with +", function() {
      var text = "abc";
      
      expect(text + "d").toBe("abcd");
    });
  });
});
