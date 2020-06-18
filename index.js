import { promises as fs } from "fs";

// Maximum amount of chars per chat message (dictated by Source)
const MAX_LINE_LENGTH = 127;
// Wait length when `say`ing multiple lines
const WAIT_LENGTH_NEWLINE = 300;
const DIGIT_KEY_MAP = {
  0: "KP_INS",
  1: "KP_END",
  2: "KP_DOWNARROW",
  3: "KP_PGDN",
  4: "KP_LEFTARROW",
  5: "KP_5",
  6: "KP_RIGHTARROW",
  7: "KP_HOME",
  8: "KP_UPARROW",
  9: "KP_PGUP",
};
// Press 0 to reset soundboard
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function soundboard(sb) {
  const CONSOLE_PREFIX = "";
  let output = `developer 1
con_filter_enable 2
con_filter_text "*****"
con_notifytime 4
alias SSBcout "con_filter_enable 0"
alias SSBendl "con_filter_enable 2"
`;

  traverse(sb, []);
  alias(`SSBreset`, bindDigits(DIGITS));
  // Resets current input and displays root options
  line(bind(0, `+SSBsay_`));
  line(reset());
  return output;

  function line(data) {
    output += `${data}\n`;
  }

  function alias(token, command) {
    line(`alias ${token} ${wrapCommand(command)}`);
  }
  /**
   * @param {string} command Must be a single command (use an alias if you need multiple commands)
   */
  function bind(key, command) {
    return `bind ${DIGIT_KEY_MAP[key]} ${command};`;
  }

  function bindDigits(pathDigits) {
    return pathDigits
      .map((pathDigit) => {
        const digits = String(pathDigit);
        return bind(digits.substr(digits.length - 1), `+SSBsay_${digits}`);
      })
      .join("");
  }

  function echo(line) {
    return `echo ${CONSOLE_PREFIX}${sanitizeLine(line)};`;
  }

  function echowrap(text) {
    return `${text}SSBendl;`;
  }

  function help(digits) {
    return echowrap(`${digits.map((d) => `SSBhelp_${d};`).join("")}`);
  }

  function reset() {
    return `SSBreset;`;
  }

  function say(line) {
    const text = sanitizeLine(line);
    let message = `${reset()}`;
    const words = text.split(" ");
    let i = 0;
    while (i < words.length) {
      if (i !== 0) {
        message += `wait ${WAIT_LENGTH_NEWLINE};`;
      }
      let lineWords = "";
      for (; i < words.length; i += 1) {
        let word = words[i];
        // If the line is a single word (no spaces), try to cut into that word
        if (lineWords.length === 0 && word.length > MAX_LINE_LENGTH) {
          word = words[i] = words[i].substr(0, MAX_LINE_LENGTH);
          i = 0;
          lineWords = word;
          break;
        }
        // Re-add space (removed by split)
        if (lineWords.length) lineWords += " ";
        // emit say
        if (lineWords.length + word.length > MAX_LINE_LENGTH) {
          break;
        }
        // If the word contains a newline, create a hard break
        if (word.includes("\n")) {
          lineWords += word.substr(0, word.indexOf("\n"));
          word = words[i] = words[i].substr(word.indexOf("\n") + 1);
          break;
        }
        lineWords += word;
        // Split into multiple lines if periods are used and there is a line to go. Try to combine sentences if possible according to line length
        if (i + 1 < words.length) {
          // Always send a new message for newlines
          if (word[word.length - 1] === "\n") {
            break;
          }
          if (word[word.length - 1] === ".") {
            let nextPeriodLength = 0;
            for (
              let iPeriod = i;
              iPeriod < words.length && nextPeriodLength <= MAX_LINE_LENGTH;
              iPeriod += 1
            ) {
              const iPeriodWord = words[iPeriod];
              // Add 1 for space
              if (nextPeriodLength > 0) nextPeriodLength += 1;
              nextPeriodLength += iPeriodWord.length;
              // Next period found, done
              if (iPeriodWord[iPeriodWord.length - 1] === ".") {
                break;
              }
            }
            if (nextPeriodLength + lineWords.length > MAX_LINE_LENGTH) {
              break;
            }
          }
        }
      }
      lineWords = lineWords.trim();
      if (lineWords.length === 0) {
        break;
      }
      message += `say ${lineWords};`;
    }
    return message;
  }

  function notfound(digits) {
    return `${reset()}${echowrap(echo(`[${digits}] unused`))}`;
  }

  function traverse(board, path) {
    const boardPath = path.join("");
    // Only digits assigned a `say`
    const boardDigits = [];
    // All digits, even `notfound` ones.
    const allDigits = [];

    if (board[0]) {
      throw new Error(
        `${[...path, "0"].join(
          "."
        )}: Digit 0 is reserved for resetting the soundboard`
      );
    }

    for (const digit of DIGITS) {
      const currentPath = [...path, digit];
      const keyDigits = currentPath.join(".");
      const digits = currentPath.join("");
      allDigits.push(digits);
      if (!(digit in board)) {
        alias(`+SSBsay_${digits}`, `SSBcout;`);
        alias(`-SSBsay_${digits}`, notfound(digits));
        continue;
      }
      const value = board[digit];

      if (typeof value === "string") {
        sound(value, currentPath);
      } else if (value && typeof value === "object") {
        const documentation = typeof value._ === "string" && value._;
        alias(
          `SSBhelp_${digits}`,
          echo(
            `[${digits}] ${
              documentation ||
              DIGITS.filter((d) => d in value).length + " lines"
            }`
          )
        );
        traverse(value, currentPath);
      } else {
        throw new Error(`soundboard.${keyDigits}: Not a string or object`);
      }
      boardDigits.push(digits);
    }

    boardDigits.sort();
    alias(`+SSBsay_${boardPath}`, `SSBcout`);
    alias(
      `-SSBsay_${boardPath}`,
      // SSBreset is already `bindDigits(DIGITS)`. This makes the script a tiny bit shorter.
      `${boardPath ? bindDigits(allDigits) : reset()}${help(boardDigits)}`
    );
    return boardDigits;
  }

  function sound(text, path) {
    const digits = path.join("");
    const saycode = say(text);
    const lineCount = saycode.split(";wait").length;
    alias(`+SSBsay_${digits}`, saycode);
    alias(`-SSBsay_${digits}`, ``);
    alias(
      `SSBhelp_${digits}`,
      echo(
        `[${digits}]${
          lineCount > 1 ? ` {${lineCount} lines}` : ""
        } ${text.replace(/\n/g, " ")}`
      )
    );
  }

  function sanitizeLine(line) {
    return line.trim().replace(/"/g, "''").replace(/;/g, "");
  }

  function wrapCommand(command) {
    if (!command) return '""';
    if (command[command.length - 1] === ";") {
      command = command.substr(0, command.length - 1);
    }
    if (command.includes(" ") || command.split(";").length > 2) {
      return '"' + command + '"';
    }
    return command;
  }
}

async function main() {
  const file = process.argv.slice(2).join(" ") || "soundboard.js";
  const { default: json } = await import("./" + file);
  try {
    var output = soundboard(json);
  } catch (e) {
    console.error(e);
  }

  await fs.writeFile("./soundboard.cfg", output);
}

main();
