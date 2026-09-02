const { NodeIO } = require('@gltf-transform/core');

async function main() {
    const io = new NodeIO();
    const document = await io.read('public/models/female.glb');
    const root = document.getRoot();
    const scene = root.getDefaultScene();
    
    // Create a new root node, put everything in it, and scale it
    const scaleNode = document.createNode('ScaleWrapper')
        .setScale([0.01, 0.01, 0.01]);
        
    for (const node of scene.listChildren()) {
        scaleNode.addChild(node);
    }
    
    scene.addChild(scaleNode);
    
    await io.write('public/models/female_scaled.glb', document);
    console.log("Done scaling!");
}
main();
