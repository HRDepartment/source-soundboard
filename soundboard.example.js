// .json format also works, but is more effort to type, and does not support comments
module.exports = {
  // Time to `wait` between lines whenever a text is multiline, in game ticks. Specifying a game's name will determine this value automatically.
  wait: 'tf2',
  1: {
    // This will be sent in chat when pressing 1 then 1 on the numpad.
    1: '11',
    2: '12',
    3: {
      // Menu selection can be cancelled by pressing 0 on the numpad. 1 3 0 would cancel your selection.
      1: '131',
      // 132. This message will be split across multiple lines (`say`s) that will be sent with a short delay using wait.
      2: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec eleifend eros in neque convallis tempus. Duis vestibulum consectetur ante nec euismod. Vestibulum et feugiat metus, sed suscipit nulla. Proin tincidunt interdum turpis, in accumsan arcu commodo in. Cras id augue ut massa posuere consectetur sit amet sed mi. Vestibulum nulla orci, tempus id turpis sed, tempus molestie ipsum. Proin sed pulvinar nisi. Mauris sollicitudin ante vel accumsan ultricies. Sed diam purus, accumsan et nisi fermentum, faucibus iaculis arcu. Aenean in enim leo. Aliquam erat volutpat. Etiam sagittis lectus eget elementum condimentum. Duis id nulla in nisi feugiat aliquet mattis et ante. Suspendisse eget eros vel elit vulputate tristique id quis est.`,
    },
  },
};
