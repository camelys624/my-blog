(() => {
  registerPaint('huiwen-border', class  {
    // Whether Alpha is allowed -> This is set to true by default, if it is set to false all colours used on the canvas will have full opacity, or alpha of 1.0
    static get inputProperties() {
      return ['--huiwen-line-width'];
    }

    paint(ctx, size, props) {
      const {width} = size;
      let lineWidth = parseInt(props.get('--huiwen-line-width')) || 2;
      // ctx - drawing context
      drawBg(ctx, size);
      ctx.beginPath();

      ctx.lineWidth = lineWidth;
      ctx.moveTo(0, 2);
      ctx.lineTo(size.width, 2);
      paintHuiwen(ctx, {width, lineWidth, beginPoint: 0});
      ctx.moveTo(0, lineWidth * 13);
      ctx.lineTo(size.width, lineWidth * 13);

      ctx.moveTo(0, size.height - lineWidth * 14);
      ctx.lineTo(size.width, size.height - lineWidth * 14);
      paintHuiwen(ctx, {width, lineWidth, beginPoint: size.height - lineWidth * 15});
      ctx.moveTo(0, size.height - lineWidth * 2);
      ctx.lineTo(size.width, size.height - lineWidth * 2);
      ctx.strokeStyle = 'white';
      ctx.stroke();

    }
  });

  function paintHuiwen(ctx, props) {
    ctx.lineJoin = 'round';
    const {lineWidth, width, beginPoint} = props;

    let num = Math.round((width - 8) / (lineWidth * 13)),
      huiwenWidth = Math.round((width - 8) / num),
      offset = null;

    for (let i = 0; i < num; i++) {
      offset = i * huiwenWidth + 3;
      if (i === 0) {
        ctx.moveTo(offset, beginPoint + lineWidth * 11);
      } else {
        ctx.lineTo(offset, beginPoint + lineWidth * 11);
      }
      ctx.lineTo(offset, beginPoint + lineWidth * 3);
      ctx.lineTo(offset + huiwenWidth - lineWidth * 2, beginPoint + lineWidth * 3);
      ctx.lineTo(offset + huiwenWidth - lineWidth * 2, beginPoint + lineWidth * 9);
      ctx.lineTo(offset + lineWidth * 4, beginPoint + lineWidth * 9);
      ctx.lineTo(offset + lineWidth * 4, beginPoint + lineWidth * 7);
      ctx.lineTo(offset + huiwenWidth - lineWidth * 4, beginPoint + lineWidth * 7);
      ctx.lineTo(offset + huiwenWidth - lineWidth * 4, beginPoint + lineWidth * 5);
      ctx.lineTo(offset + lineWidth * 2, beginPoint + lineWidth * 5);
      ctx.lineTo(offset + lineWidth * 2, beginPoint + lineWidth * 11);
      ctx.lineTo(offset + huiwenWidth, beginPoint + lineWidth * 11);
    }
  }

  function drawBg(ctx, size) {
    const {width, height} = size;
    let gradient  = ctx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, Math.max(width, height) - 60);
    gradient.addColorStop(0, '#2C3E50');
    gradient.addColorStop(1, '#000000');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    // ctx.filter = 'blur(4px)';
  }
})();
