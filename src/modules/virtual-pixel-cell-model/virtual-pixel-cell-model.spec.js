describe('virtual-pixel-cell-model', function () {

    var core = require('@grid/grid-spec-helper')();
    var model;
    var numRows = 100;
    var numCols = 10;
    var grid;

    beforeEach(function () {
        grid = core.buildSimpleGrid(numRows, numCols);
        model = grid.virtualPixelCellModel;

    });

    it('should tell me the data row of a virtual top location', function () {
        expect(model.getRow(91)).toBe(3);
    });

    it('should tell the the data col of a virtual left location', function () {
        expect(model.getCol(201)).toBe(2);
    });

    it('should return NaN if the px value is above or below the possible values', function () {
        expect(model.getCol(-1)).toBeNaN();
        expect(model.getCol(1000000000)).toBeNaN();
        expect(model.getRow(-1)).toBeNaN();
        expect(model.getRow(1000000000)).toBeNaN();
    });

    it('should tell the virtual height of a row', function () {
        expect(model.height(2)).toBe(30);
    });

    it('should tell the virtual width of a col', function () {
        expect(model.width(3)).toBe(100);
    });

    it('should calculate the height between rows inclusively', function () {
        expect(model.height(2, 3)).toBe(60);
    });

    it('should calculate the width between cols inclusively', function () {
        expect(model.width(3, 5)).toBe(300);
    });

    it('should return 0 for out of order ranges', function () {
        expect(model.height(1, 0)).toBe(0);
        expect(model.width(1, 0)).toBe(0);
        expect(model.height(3, 1)).toBe(0);
        expect(model.width(4, 1)).toBe(0);
        expect(model.height(0, -1)).toBe(0);
        expect(model.width(0, -1)).toBe(0);
    });

    it('should let me clamp a row or col', function () {
        expect(model.clampRow(-1)).toBe(0);
        expect(model.clampCol(-1)).toBe(0);
        expect(model.clampRow(10000000)).toBe(100);
        expect(model.clampCol(10000000)).toBe(10);
    });


    it('should clamp to the virtual cell size', function () {
        expect(model.height(99, 110)).toBe(2 * 30);
        expect(model.width(9, 11)).toBe(200);
    });

    it('should notify listeners on size changes', function () {

    });
});