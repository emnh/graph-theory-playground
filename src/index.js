
const $ = require('jquery');
const PIXI = require('pixi.js');
const createLayout = require('ngraph.forcelayout');
var createGraph = require('ngraph.graph');

const main = function() {

    const graph = {
        v: [1, 2, 3, 4],
        e: [
            [1, 2],
            [1, 3],
            [1, 4],
            [2, 3],
            [2, 4],
            [3, 4]
        ],
        vg: [],
        ve: [],
        ngraph: createGraph()
    };

    for (let i = 0; i < graph.v.length; i++) {
        graph.ngraph.addNode(graph.v[i]);
    }

    for (let i = 0; i < graph.e.length; i++) {
        graph.ngraph.addLink(graph.e[i][0], graph.e[i][1]);
        // graph.ngraph.addLink(graph.e[i][1], graph.e[i][0]);
    }

    // Write a function that draws the graph using pixi.js

    // Draw the graph
    const app = new PIXI.Application({
        width: 800,
        height: 600,
        backgroundColor: 0x1099bb,
        antialias: true
    });

    document.body.appendChild(app.view);

    app.stage.interactive = true;

    const physicsSettings = {
        timeStep: 0.5,
        dimensions: 2,
        gravity: -12,
        theta: 0.8,
        springLength: 10,
        springCoefficient: 0.8,
        dragCoefficient: 0.9,
    };
    const layout = createLayout(graph.ngraph, physicsSettings);

    const container = new PIXI.Container();
    app.stage.addChild(container);
    const cw = app.renderer.width * 0.8;
    const ch = app.renderer.height * 0.8;
    container.width = cw;
    container.height = ch;
    container.x = app.renderer.width / 2 - container.width / 2;
    container.y = app.renderer.height / 2 - container.height / 2;

    for (let i = 0; i < graph.v.length; i++) {
        const v = graph.v[i];
        const vpos = layout.getNodePosition(v);

        const graphics = new PIXI.Graphics();
        graphics.lineStyle(2, 0x0000FF, 1);
        graphics.beginFill(0xFFFFFF, 1);
        graphics.drawCircle(0, 0, 20);
        graphics.endFill();
        container.addChild(graphics);
        const text = new PIXI.Text(v, {
            fontFamily: 'Arial',
            fontSize: 20,
            fill: 0x000000,
            align: 'center'
        });
        // graphics.zIndex = -1;
        // text.zIndex = -2;
        graphics.addChild(text);
        text.x = -text.width / 2;
        text.y = -text.height / 2;
        graph.vg[v] = graphics;
    }

    const lines = new PIXI.Container();
    container.sortableChildren = true;
    container.addChild(lines);
    container.zIndex = 0;
    lines.zIndex = -1;

    app.ticker.add((delta) => {
        layout.step();
        
        const rect = layout.getGraphRect();
        const fx = (x) => ((x - rect.min_x) / (rect.max_x - rect.min_x)) * 0.5 * cw - 0.25 * cw;
        const fy = (y) => ((y - rect.min_y) / (rect.max_y - rect.min_y)) * 0.5 * ch - 0.25 * ch;

        for (let i = 0; i < graph.v.length; i++) {
            const v = graph.v[i];
            const vpos = layout.getNodePosition(v);
            const vg = graph.vg[v];
            vg.x = fx(vpos.x);
            vg.y = fy(vpos.y);
        }
        for (let i = lines.children.length - 1; i >= 0; i--) {
            lines.removeChildAt(i);
        }
        for (let i = 0; i < graph.e.length; i++) {
            const e = graph.e[i];
            const v1 = e[0];
            const v2 = e[1];
            const v1g = graph.vg[v1];
            const v2g = graph.vg[v2];
            const line = new PIXI.Graphics();
            line.lineStyle(2, 0xFFFFFF, 1);
            line.moveTo(v1g.x, v1g.y);
            line.lineTo(v2g.x, v2g.y);
            lines.addChild(line);
        }
    });

};

$(main);