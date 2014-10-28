var mockEvent = require('@grid/custom-event');

describe('col-resize', function () {
    var $ = require('jquery');

    var helper = require('@grid/grid-spec-helper')();
    var grid;
    var colResize;
    beforeEach(function () {
        grid = helper.buildSimpleGrid();
        colResize = grid.colResize;
    });

    describe('should satisfy', function () {
        var ctx = {};
        beforeEach(function () {
            ctx.helper = helper;
            ctx.headerDecorators = colResize;
        });

        //covers the decorator interface
        require('@grid/header-decorators/header-decorators.spec')(ctx);
    });

    describe('decorator', function () {
        var ctx = {};
        var viewCol = 1;
        beforeEach(function () {
            ctx.helper = helper;
            ctx.decorator = colResize._decorators[viewCol];
        });

        it('should have a styleable class', function () {
            expect(ctx.decorator.render()).toHaveClass('col-resize');
        });

        it('should center on the right side of its bounding box', function () {
            helper.viewBuild();
            var style = document.createElement('style');
            style.innerHTML = '.col-resize{width : 6px}';
            document.body.appendChild(style);
            helper.onDraw(function () {
                var $rendered = $(ctx.decorator.boundingBox.firstChild);
                var $box = $(ctx.decorator.boundingBox);
                var width = $rendered.width();
                expect($rendered.position().left).toBe($box.width() - width / 2);
                expect($rendered.position().top).toBe(0);
                expect($rendered.height()).toBe($box.height());
                document.body.removeChild(style);
            });
        });

        it('should bind a drag event on render', function () {
            var spy = spyOn(grid.eventLoop, 'bind');
            var dragElem = ctx.decorator.render();
            expect(spy).toHaveBeenBoundWith('grid-drag-start', dragElem);
        });

        describe('drag', function () {
            var dragCtx = {};
            var dragStart = 100;
            beforeEach(function () {
                dragCtx.helper = helper;
                var e = mockEvent('grid-drag-start', true);
                e.gridX = dragStart;
                ctx.decorator._onDragStart(e);
                dragCtx.decorator = ctx.decorator._dragLine;
            });

            it('should add a decorator', function () {
                expect(grid.decorators.getAlive()).toContain(ctx.decorator._dragLine);
            });

            it('should be 1px wide and as tall as teh view', function () {
                expect(dragCtx.decorator).topToBe(0);
                expect(dragCtx.decorator).widthToBe(1);
                expect(dragCtx.decorator).heightToBe(Infinity);
                expect(dragCtx.decorator).unitsToBe('px');
                expect(dragCtx.decorator).spaceToBe('real');
            });

            it('should render with a styleable class', function () {
                expect(dragCtx.decorator.render()).toHaveClass('grid-drag-line');
            });

            function fireDrag(x) {
                var drag = mockEvent('grid-drag');
                var gridX = x;
                drag.gridX = gridX;
                grid.eventLoop.fire(drag);
                return gridX;
            }

            it('should move the left on grid drag', function () {
                var gridX = fireDrag(dragStart + 10);
                expect(dragCtx.decorator).leftToBe(gridX);
            });

            function getDecoratorLeft() {
                return grid.viewPort.toGridX(ctx.decorator.boundingBox.getClientRects()[0].left);
            }

            it('should min out at decorator left + 10', function () {
                $(helper.container).css({'margin-left': '10px'});
                helper.viewBuild();
                helper.onDraw(function () {
                    var drag = mockEvent('grid-drag');
                    var decoratorLeft = getDecoratorLeft();
                    var gridX = decoratorLeft;
                    drag.gridX = gridX;
                    grid.eventLoop.fire(drag);
                    expect(dragCtx.decorator).leftToBe(decoratorLeft + 10);
                });

            });

            it('should remove the decorator on drag end', function () {
                grid.eventLoop.fire(mockEvent('grid-drag-end'));
                expect(grid.decorators.popAllDead()).toContain(dragCtx.decorator);
            });

            it('should set the col width on drag-end', function () {
                fireDrag(dragStart + 10);
                grid.eventLoop.fire(mockEvent('grid-drag-end'));
                var colObj = grid.colModel.get(viewCol);
                expect(colObj).widthToBe(dragStart + 10);
            });

            it('should set the correct width if scrolled', function () {
                var colScroll = 1;
                grid.cellScrollModel.scrollTo(0, colScroll);
                fireDrag(dragStart + 10);
                grid.eventLoop.fire(mockEvent('grid-drag-end'));
                var colObj = grid.colModel.get(viewCol + colScroll);
                expect(colObj).widthToBe(dragStart + 10);
            });

            describe('should satisfy', function () {
                require('@grid/decorators/decorator-test-body')(dragCtx);
            });
        });

    });

});