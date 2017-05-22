const expect = require('chai').expect;
const converter = require('./converter');

describe('Converter Module', function () {
  it('should remove ignored elements', function () {
    const css = `
      .elem {
        color: white;
        font-size:10px;
      }

      :theme1 {
        .elem {
          color: blue;
        }
      }

      .elem2 {
        font-size: 16px;
      }

      :theme2 {
        .elem {
          color: red;
        }

        .elem2 {
          font-size: 12px;
        }
      }
    `;

    const result = converter({ text: css, ignore: [':theme1', ':theme2'] });
    expect(result.replace(/\s*/g, '')).to.be.equal('.elem{color:white;font-size:10px;}.elem2{font-size:16px;}');
  });

  it('should remove ignored elements, insert only from target', function () {
    const css = `
      .elem {
        color: white;
        font-size:10px;
      }

      :target {
        .elem {
          color: red;
        }
      }

      :theme1 {
        .elem {
          color: blue;
        }
      }
    `;
    const result = converter({ text: css, target: ':target', ignore: [':theme1'] });
    expect(result.replace(/\s*/g, '')).to.be.equal('.elem{color:red;font-size:10px;}');
  });

  it('should add new style elements from target', function () {
    const css = `
      .elem {
        color: white;
        font-size:10px;
      }

      :target {
        .elem {
          color: red;
        }

        .elem2 {
          color: blue;
        }
      }
    `;
    const result = converter({ text: css, target: ':target' });
    expect(result.replace(/\s*/g, '')).to.be.equal('.elem{color:red;font-size:10px;}.elem2{color:blue;}');
  });

  it('should merge existing styles from target to default by adding not-existing rules', function () {
    const css = `
      .elem {
        color: white;
        font-size:10px;
      }

      :target {
        .elem {
          color: red;
          text-decoration: underline;
        }
      }
    `;
    const result = converter({ text: css, target: ':target' });
    expect(result.replace(/\s*/g, '')).to.be.equal('.elem{color:red;font-size:10px;text-decoration:underline;}');
  });

  it('should merge content using nested sass styles', function () {
    const scss = `
      .elem {
        color: white;
        font-size:10px;

        .elem3 {
          color: red;
        }
      }

      :target {
        .elem {
          color: red;
          text-decoration: underline;

          .elem3 {
            color: blue;
          }

          .elem4 {
            color: white;
          }
        }
      }
    `;
    const result = converter({ text: scss, target: ':target' });
    expect(result.replace(/\s*/g, '')).to.be.equal('.elem{color:red;font-size:10px;text-decoration:underline;.elem3{color:blue;}.elem4{color:white;}}');
  });

  it('should do nothing', function () {

  });
});
