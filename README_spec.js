describe("literate-jasmine ", function() {
  var PI;

  describe("Mathematics", function() {

    beforeEach(function() {
      PI = 22/7;
    });

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

    it("calculates the circumference of a circle", function() {
      var circumference = function(radius) {
        return 2 * PI * radius;
      };

      expect(circumference(5)).toBe(2 * 22/7 * 5);
    });

  });

  describe("Strings", function() {

    it("appending works with +", function() {
      var text = "abc";

      expect(text + "d").toBe("abcd");
    });

  });

});
