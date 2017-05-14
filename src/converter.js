const _ = require('lodash');

const NODECONTENT_KEY = 'node-content';

function getTargetPos(text, target) {
  const regex = new RegExp(`(${target}\\s{)`);
  let selector;
  if ((selector = regex.exec(text)) !== null) {
    const blockStart = selector.index + selector[1].length;
    const closingPos = closingTagPos(text.slice(blockStart));
    if (closingPos < 0) {
      throw Error('Invalid syntax, missing closing tag.');
    }

    return {
      start: selector.index,
      end: blockStart + closingPos,
    };
  }

  return null;
}

function blockify(text) {
  let searchIdx = 0;
  let selector = null;
  const regexOpen = /\s*([:.#\w\s-]+)\s*\n?\{/i;
  const blocks = { [NODECONTENT_KEY]: [] };
  while ((selector = regexOpen.exec(text.slice(searchIdx))) !== null) {
    const preText = text.slice(searchIdx, selector.index).trim();
    if (preText) {
      const rules = preText.split(';');
      for (const rule of rules) {
        if (rule.trim().length) blocks[NODECONTENT_KEY].push(rule);
      }
    }

    const blockContentIdx = searchIdx + selector.index + selector[0].length;
    const closingPos = blockContentIdx + closingTagPos(text.slice(blockContentIdx));
    const updatedText = text.slice(selector.index, closingPos + 1);
    const { label, value } = labelify(updatedText, selector[1].trim());
    blocks[label] = blockify(value);

    searchIdx = closingPos + 1;
  }

  const postText = text.slice(searchIdx).trim();
  if (postText) {
    const rules = postText.split(';');
    for (const rule of rules) {
      if (rule.trim().length) blocks[NODECONTENT_KEY].push(rule);
    }
  }

  if (blocks[NODECONTENT_KEY].length === 0) {
    delete blocks[NODECONTENT_KEY];
  }

  return blocks;
}

function closingTagPos(text, openTag = '{', closingTag = '}') {
  let balance = 1;
  const chain = text.split('');
  for (let chIdx = 0; chIdx < chain.length; chIdx += 1) {
    const char = chain[chIdx];
    if (char === openTag) {
      balance += 1;
    } else if (char === closingTag) {
      balance -= 1;
      if (balance === 0) {
        return chIdx;
      }
    }
  }

  throw new Error('Invalid syntax: not closing tag found.');
}

function labelify(text, selector) {
  const regex = new RegExp(`(${selector})\\s({)`);
  let match;
  if ((match = regex.exec(text)) !== null) {
    const blockStart = match.index + match[0].length;
    const closingPos = closingTagPos(text.slice(blockStart));
    if (closingPos < 0) {
      throw Error('Invalid syntax, missing closing tag.');
    }

    return {
      label: match[1].trim(),
      value: text.slice(blockStart, blockStart + closingPos).trim(),
    };
  }

  throw Error('Missing selector in text.');
}

function buildCssFromJs(obj) {
    // console.log('**********************************\n\n\n', obj);
  let text = '';
  for (const key in (obj || {})) {
    if (key !== NODECONTENT_KEY) {
      text += `${key} { \n`;
      text += `\t${buildCssFromJs(obj[key])}\n`;
      text += '}\n\n';
    } else {
      text += `${obj[key].join(';')};\n`;
    }
  }

  return text;
}

function mergeStyles(target, toMerge) {
  return _.mergeWith(
    target, toMerge,
    (objValue, srcValue) => (_.isArray(objValue) ? objValue.concat(srcValue) : undefined));
}

module.exports = ({ text, target, ignore }) => {
  let updatedText = text;
  if (!text || !target) {
    return text;
  }

  for (const iKey of (ignore || [])) {
    const iKeyPos = getTargetPos(updatedText, iKey);
    if (iKeyPos) {
      updatedText = `${updatedText.slice(0, iKeyPos.start)}${updatedText.slice(iKeyPos.end + 1)}`;
    }
  }

  let targetBlock = {};
  const targetPos = getTargetPos(updatedText, target);
  if (targetPos) {
    const targetBlockText = updatedText.slice(targetPos.start, targetPos.end + 1);
    updatedText = `${updatedText.slice(0, targetPos.start)}\n${updatedText.slice(targetPos.end + 1)}`;

    const { value } = labelify(targetBlockText, target);
    targetBlock = blockify(value);
  }

  let blocks = blockify(updatedText);
  blocks = mergeStyles(blocks, targetBlock);

  return buildCssFromJs(blocks);
};
