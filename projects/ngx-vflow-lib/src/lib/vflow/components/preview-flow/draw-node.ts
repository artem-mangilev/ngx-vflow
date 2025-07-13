import { NodeModel } from '../../models/node.model';

export function drawNode(ctx: CanvasRenderingContext2D, node: NodeModel) {
  if (Object.keys(node.preview().style).length) {
    drawStyledNode(ctx, node);
    return;
  }

  if (node.rawNode.type === 'default') {
    drawDefaultNode(ctx, node);
    return;
  }

  if (node.rawNode.type === 'default-group') {
    drawDefaultGroupNode(ctx, node);
    return;
  }

  drawUnknownNode(ctx, node);
}

function drawDefaultNode(ctx: CanvasRenderingContext2D, node: NodeModel) {
  const point = node.globalPoint();
  const width = node.width();
  const height = node.height();

  borderRadius(ctx, node, 5);

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

function drawDefaultGroupNode(ctx: CanvasRenderingContext2D, node: NodeModel) {
  const point = node.globalPoint();
  const width = node.width();
  const height = node.height();

  ctx.globalAlpha = 0.05;
  ctx.fillStyle = node.color();
  ctx.fillRect(point.x, point.y, width, height);
  ctx.globalAlpha = 1;

  ctx.strokeStyle = node.color();
  ctx.lineWidth = 1.5;
  ctx.strokeRect(point.x, point.y, width, height);
}

function drawStyledNode(ctx: CanvasRenderingContext2D, node: NodeModel) {
  const point = node.globalPoint();
  const width = node.width();
  const height = node.height();
  const style = node.preview().style;

  if (style.borderRadius) {
    const radius = parseFloat(style.borderRadius);
    borderRadius(ctx, node, radius);
  } else {
    ctx.beginPath();
    ctx.rect(point.x, point.y, width, height);
    ctx.closePath();
  }

  if (style.backgroundColor) {
    ctx.fillStyle = style.backgroundColor;
  }

  if (style.borderColor) {
    ctx.strokeStyle = style.borderColor;
  }

  if (style.borderWidth) {
    ctx.lineWidth = parseFloat(style.borderWidth);
  }

  ctx.fill();
  ctx.stroke();
}

function drawUnknownNode(ctx: CanvasRenderingContext2D, node: NodeModel) {
  const point = node.globalPoint();
  const width = node.width();
  const height = node.height();

  ctx.fillStyle = 'rgb(0 0 0 / 10%)';
  ctx.fillRect(point.x, point.y, width, height);
}

function borderRadius(ctx: CanvasRenderingContext2D, node: NodeModel, radius: number) {
  const point = node.globalPoint();
  const width = node.width();
  const height = node.height();

  // Create rounded rectangle path
  ctx.beginPath();
  ctx.moveTo(point.x + radius, point.y);
  ctx.lineTo(point.x + width - radius, point.y);
  ctx.quadraticCurveTo(point.x + width, point.y, point.x + width, point.y + radius);
  ctx.lineTo(point.x + width, point.y + height - radius);
  ctx.quadraticCurveTo(point.x + width, point.y + height, point.x + width - radius, point.y + height);
  ctx.lineTo(point.x + radius, point.y + height);
  ctx.quadraticCurveTo(point.x, point.y + height, point.x, point.y + height - radius);
  ctx.lineTo(point.x, point.y + radius);
  ctx.quadraticCurveTo(point.x, point.y, point.x + radius, point.y);
  ctx.closePath();
}
