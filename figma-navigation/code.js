async function update() {
  const page = figma.root.children.find((p) => p.name === "Кинополка · Экраны");
  if (!page) throw Error("Откройте файл Кинополки");
  await figma.setCurrentPageAsync(page);
  const nav = await figma.getNodeByIdAsync("1:12");
  const start = await figma.getNodeByIdAsync("2:2");
  if (!nav || !start || nav.type !== "COMPONENT")
    throw Error("Исходная навигация недоступна");
  const screens = page.children.filter(
    (n) => n.type === "FRAME" && n.width === 1280,
  );
  const byName = Object.fromEntries(screens.map((n) => [n.name, n]));
  const paint = (hex) => [{ type: "SOLID", color: figma.util.rgb(hex) }];
  const coral = "#FF6F61",
    light = "#F8F5EF",
    dark = "#22262B";
  const regular = { family: "Inter", style: "Regular" },
    bold = { family: "Inter", style: "Semi Bold" };
  await Promise.all([figma.loadFontAsync(regular), figma.loadFontAsync(bold)]);
  function frame(p, name, x, y, w, h, color, r = 0) {
    const a = figma.createFrame();
    p.appendChild(a);
    a.name = name;
    a.resize(w, h);
    a.x = x;
    a.y = y;
    a.fills = color ? paint(color) : [];
    a.cornerRadius = r;
    return a;
  }
  function label(p, s, x, y, size, color = light, font = bold) {
    const a = figma.createText();
    p.appendChild(a);
    a.fontName = font;
    a.fontSize = size;
    a.characters = s;
    a.name = s;
    a.x = x;
    a.y = y;
    a.fills = paint(color);
    return a;
  }
  function link(n, target, overlay = false) {
    return n.setReactionsAsync([
      {
        trigger: { type: "ON_CLICK" },
        actions: [
          {
            type: "NODE",
            destinationId: target.id,
            navigation: overlay ? "OVERLAY" : "NAVIGATE",
            transition: overlay
              ? {
                  type: "MOVE_IN",
                  direction: "LEFT",
                  duration: 0.24,
                  easing: { type: "EASE_OUT" },
                  matchLayers: false,
                }
              : null,
            preserveScrollPosition: false,
          },
        ],
      },
    ]);
  }
  const oldMark = nav.children.find((n) => n.name === "Знак · полка");
  if (oldMark) oldMark.visible = false;
  if (!nav.children.some((n) => n.name === "Корешки")) {
    const mark = figma.createNodeFromSvg(
      '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 64 64"><path fill="#FF6F61" d="M5 11h10v38H5zM20 7h11v42H20zM34 13l9-4 16 36-9 4zM4 53h56v6H4z"/></svg>',
    );
    nav.appendChild(mark);
    mark.name = "Корешки";
    mark.x = 50;
    mark.y = 20;
  }
  const navText = (s) =>
    nav.children.find((n) => n.type === "TEXT" && n.characters === s);
  const helper = nav.children.find((n) => n.name === "→ Киночат");
  if (helper) helper.visible = false;
  let home = navText("Главная") || label(nav, "Главная", 0, 29, 15);
  const items = [
    home,
    ...["Каталог", "Подборки", "Для меня", "Моя полка"].map(navText),
  ];
  let x = (1280 - items.reduce((s, n) => s + n.width, 0) - 4 * 30) / 2;
  for (const item of items) {
    item.x = x;
    item.y = 29;
    x += item.width + 30;
  }
  let account = nav.children.find((n) => n.name === "Аккаунт");
  if (!account) {
    account = frame(nav, "Аккаунт", 1096, 17, 132, 42, "#30353B", 21);
    nav.insertChild(0, account);
    const avatar = frame(account, "Аватар", 6, 5, 32, 32, coral, 16);
    label(avatar, "М", 8, 6, 16, dark);
    label(account, "⌄", 110, 10, 14);
  }
  const nickname = nav.children.find((n) => n.name === "→ Профиль");
  nickname.characters = "Мира";
  nickname.x = 1144;
  nickname.y = 29;
  let signed = byName["Главная · Мира"];
  if (!signed) {
    signed = start.clone();
    page.appendChild(signed);
    signed.name = "Главная · Мира";
    signed.x = 2820;
    signed.y = 22220;
  }
  let drawer = page.children.find((n) => n.name === "AI menu · Боковой чат");
  if (!drawer) {
    drawer = frame(
      page,
      "AI menu · Боковой чат",
      5800,
      1200,
      440,
      680,
      dark,
      14,
    );
    label(drawer, "AI menu", 26, 22, 13, coral);
    label(drawer, "Киночат", 24, 50, 32);
    const close = frame(drawer, "Закрыть чат", 372, 28, 42, 42, "#30353B", 21);
    label(close, "×", 12, 4, 25);
    await close.setReactionsAsync([
      { trigger: { type: "ON_CLICK" }, actions: [{ type: "CLOSE" }] },
    ]);
    frame(drawer, "Разделитель", 24, 111, 392, 1, "#484D52");
    const q = frame(drawer, "Вопрос зрителя", 80, 140, 335, 75, "#393F46", 16);
    label(q, "Что посмотреть после\n«Интерстеллара»?", 16, 13, 17);
    label(drawer, "Кинополка", 24, 250, 14, coral);
    label(
      drawer,
      "Попробуйте «Дюну». Здесь тоже есть\nдалёкая планета, история семьи\nи ощущение огромного мира.",
      24,
      283,
      17,
      light,
      regular,
    );
    const rec = frame(drawer, "Открыть Дюну", 24, 390, 392, 96, "#30353B", 10);
    const poster = await figma.getNodeByIdAsync("1:42");
    if (poster) {
      const image = poster.children[0].clone();
      rec.appendChild(image);
      image.rescale(0.29);
      image.x = 8;
      image.y = 7;
    }
    label(rec, "Дюна", 89, 18, 21);
    label(rec, "2021  ·  Фантастика", 89, 54, 14, "#C1C2BD", regular);
    await link(rec, byName["Фильм 2"]);
    const input = frame(
      drawer,
      "Поле сообщения",
      24,
      604,
      392,
      52,
      "#30353B",
      12,
    );
    label(input, "Спросить о кино…", 16, 16, 16, "#C1C2BD", regular);
    const send = frame(input, "Отправить", 344, 6, 40, 40, coral, 10);
    label(send, "↑", 12, 6, 22, dark);
    drawer.name = "Панель чата";
    const overlay = frame(
      page,
      "AI menu · Боковой чат",
      5800,
      1200,
      1280,
      680,
      null,
    );
    const dismiss = frame(
      overlay,
      "Вернуться к странице",
      0,
      0,
      840,
      680,
      "#181B1E",
    );
    dismiss.opacity = 0.36;
    await dismiss.setReactionsAsync([
      { trigger: { type: "ON_CLICK" }, actions: [{ type: "CLOSE" }] },
    ]);
    overlay.appendChild(drawer);
    drawer.x = 840;
    drawer.y = 0;
    drawer = overlay;
  }
  let count = 0;
  for (const screen of [...new Set([...screens, signed])]) {
    const instance = screen.children.find(
      (n) => n.type === "INSTANCE" && n.name === nav.name,
    );
    if (!instance) continue;
    const acct = instance.children.find((n) => n.name === "Аккаунт");
    const name = instance.children.find(
      (n) =>
        n.type === "TEXT" && (n.name === "→ Профиль" || n.name === "→ Вход"),
    );
    const guest =
      screen !== signed &&
      ((name && name.characters === "Войти") ||
        screen.name.includes("· гость"));
    if (name && acct) {
      name.characters = guest ? "Войти" : "Мира";
      name.fills = paint(guest ? dark : light);
      acct.fills = paint(guest ? coral : "#30353B");
      const avatar = acct.children[0];
      avatar.fills = paint(guest ? dark : coral);
      const letter = avatar.children[0];
      letter.characters = guest ? "↗" : "М";
      letter.fills = paint(guest ? coral : dark);
      acct.children[1].visible = !guest;
      const target = guest ? byName["Вход"] : byName["Профиль"];
      if (screen !== target) {
        await link(acct, target);
        await link(name, target);
      }
    }
    const current = instance.children.find(
      (n) => n.type === "TEXT" && n.characters === "Главная",
    );
    if (current) {
      current.fills = paint(
        screen === start || screen === signed ? coral : "#C1C2BD",
      );
      if (screen !== start && screen !== signed)
        await link(current, guest ? start : signed);
    }
    if (screen === signed) {
      for (const n of instance.children) {
        if (n.name === "→ Рекомендации") await link(n, byName["Рекомендации"]);
        if (n.name === "→ Избранное") await link(n, byName["Избранное"]);
      }
    }
    let tab = screen.children.find((n) => n.name === "AI menu · Вкладка");
    if (!tab) {
      tab = frame(screen, "AI menu · Вкладка", 1240, 320, 40, 108, coral, 10);
      tab.topRightRadius = 0;
      tab.bottomRightRadius = 0;
      const title = label(tab, "AI menu", 0, 0, 15, dark);
      title.rotation = 90;
      title.x = 10;
      title.y = 85;
      tab.constraints = { horizontal: "MAX", vertical: "MIN" };
    }
    await link(tab, drawer, true);
    count++;
  }
  figma.currentPage.selection = [start];
  figma.viewport.scrollAndZoomIntoView([start]);
  figma.closePlugin("Шапка и AI menu обновлены · " + count + " экранов");
}
update().catch((e) => figma.closePlugin("Кинополка: " + e.message));
