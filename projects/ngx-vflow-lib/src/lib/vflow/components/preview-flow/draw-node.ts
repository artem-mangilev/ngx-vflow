import { NodeModel } from '../../models/node.model';

export function drawNode(ctx: CanvasRenderingContext2D, node: NodeModel) {
  if (node.rawNode.type === 'default') {
    drawDefaultNode(ctx, node);
  } else {
    const point = node.globalPoint();
    const width = node.width();
    const height = node.height();

    ctx.fillStyle = 'rgb(0 0 0 / 10%)';
    ctx.fillRect(point.x, point.y, width, height);
  }
}

function drawDefaultNode(ctx: CanvasRenderingContext2D, node: NodeModel) {
  const point = node.globalPoint();
  const width = node.width();
  const height = node.height();

  const borderRadius = 5; // Add border radius

  // Create rounded rectangle path
  ctx.beginPath();
  ctx.moveTo(point.x + borderRadius, point.y);
  ctx.lineTo(point.x + width - borderRadius, point.y);
  ctx.quadraticCurveTo(point.x + width, point.y, point.x + width, point.y + borderRadius);
  ctx.lineTo(point.x + width, point.y + height - borderRadius);
  ctx.quadraticCurveTo(point.x + width, point.y + height, point.x + width - borderRadius, point.y + height);
  ctx.lineTo(point.x + borderRadius, point.y + height);
  ctx.quadraticCurveTo(point.x, point.y + height, point.x, point.y + height - borderRadius);
  ctx.lineTo(point.x, point.y + borderRadius);
  ctx.quadraticCurveTo(point.x, point.y, point.x + borderRadius, point.y);
  ctx.closePath();

  // Draw background (background-color: white)
  ctx.fillStyle = 'white';
  ctx.fill();

  // Draw border (border: 1.5px solid #1b262c)
  ctx.strokeStyle = '#1b262c';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Draw centered text (color: black, justify-content: center)
  ctx.fillStyle = 'black';
  // TODO: use as in default node
  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const centerX = point.x + width / 2;
  const centerY = point.y + height / 2;
  ctx.fillText(node.text(), centerX, centerY);
}
