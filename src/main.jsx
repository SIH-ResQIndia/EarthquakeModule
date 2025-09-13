import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import Phaser from 'phaser';

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

const speedDown = 300;

class GameScene extends Phaser.Scene {
  constructor() {
    super("scene-game");
    this.fan1 = null;
    this.fan2 = null;
    this.messageBox = null;
    this.messageText = null;
    this.talker = null;
    this.earthquake = null;
    this.dialogues = [
      "Oh no! The ground is shaking...",
      "Stay calm, don’t panic!",
      "Let us learn how we should deal with it!",
      "With mindfulness and knowledge we can tackle it together!"
    ];
    this.dialogueIndex = 0;
  }

  preload() {
    this.load.image("bg", "/assets/bg_classroom.jpg");
    this.load.image("bg_afterearthquake", "/assets/bg_afterearthquake.jpg");
    this.load.image("modal", "/assets/modal.png");
    this.load.image("hiding", "/assets/hiding_under_bench.jpg");
    this.load.image("running", "/assets/runningeq.jpg");

    this.load.spritesheet('talker', '/assets/talker.png', {
      frameWidth: 1000,
      frameHeight: 1000
    });
    this.load.spritesheet('fansprite', '/assets/fansprite.png', {
      frameWidth: 370,
      frameHeight: 220
    });

    this.load.audio('earthquake_sound', '/assets/earthquake.mp3');
    this.load.audio('d1', '/assets/dialogue1.mp3');
    this.load.audio('d2', '/assets/Dialogue 2.mp3');
    this.load.audio('d3', '/assets/dialogue 3.mp3');
    this.load.audio('d4', '/assets/dialogue 4.mp3');
    this.load.audio('c1', '/assets/consequence 1.mp3');
    this.load.audio('c2', '/assets/consequence 2.mp3');
    this.load.audio('q', '/assets/question.mp3');
    this.load.audio('op', '/assets/options.mp3');


  }

  create() {
    // Background
    this.bg = this.add.image(0, 0, "bg").setOrigin(0, 0).setScale(1.2, 0.9);

    // Talker animation
    this.anims.create({
      key: 'talk',
      frames: this.anims.generateFrameNumbers('talker', { frames: [0, 1, 2, 3] }),
      frameRate: 4,
      repeat: -1
    });

    this.talker = this.add.sprite(100, this.scale.height - 200, 'talker').setScale(0.5).setDepth(30);
    this.talker.setVisible(false);

    // Fan animation
    this.anims.create({
      key: 'fanrotate',
      frames: this.anims.generateFrameNumbers('fansprite', { frames: [0, 5, 20] }),
      frameRate: 8,
      repeat: -1
    });

    this.fan1 = this.add.sprite(430, 60, 'fansprite').setScale(0.8).setRotation(Phaser.Math.DegToRad(25));
    this.fan2 = this.add.sprite(980, 60, 'fansprite').setScale(0.8).setRotation(Phaser.Math.DegToRad(25));
    this.fan1.play('fanrotate');
    this.fan2.play('fanrotate');

    // Preload sound for instant play
    this.earthquakeSound = this.sound.add('earthquake_sound');
    this.d1 = this.sound.add('d1');
    this.d2 = this.sound.add('d2');
    this.d3 = this.sound.add('d3');
    this.d4 = this.sound.add('d4');
    this.quiz = this.sound.add('q');
    this.op=this.sound.add('op');
    this.c1 = this.sound.add('c1');
    this.c2 = this.sound.add('c2');
    
this.dialogueSounds = [this.d1, this.d2, this.d3, this.d4];

    // --- Start Quiz button (simple) ---
    this.startButtonBg = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      200,
      60,
      0x2563eb // Tailwind blue
    ).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.startButtonText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2,
      "Start Module",
      { fontSize: "22px", color: "#fff", fontFamily: "Arial" }
    ).setOrigin(0.5);

    this.startButtonBg.on("pointerdown", () => {
      this.startButtonBg.destroy();
      this.startButtonText.destroy();
      this.startQuiz();
    });
  }

  startQuiz() {
    if (this.earthquake) this.earthquake.destroy();
    this.earthquake = this.add.image(this.scale.width / 2, this.scale.height / 2, 'bg_afterearthquake')
      .setOrigin(0.5)
      .setDisplaySize(this.scale.width, this.scale.height);

    // Play earthquake sound instantly
    this.earthquakeSound.play();

    // Shake camera for 13 seconds
    this.cameras.main.shake(13000, 0.003);

    // Show talker
    this.talker.setVisible(true);
    this.talker.play('talk');
    this.talker.setPosition(440,280)

    // Show dialogues
    this.dialogueIndex = 0;
    this.showDialogues();
  }

  showDialogues() {
    if (this.messageBox) this.messageBox.destroy();
    if (this.messageText) this.messageText.destroy();

    const message = this.dialogues[this.dialogueIndex];
    if (!message) return;

    this.messageBox = this.add.image(
      this.scale.width / 2,
      this.scale.height / 2 - 150,
      'modal'
    ).setOrigin(0.5).setDisplaySize(660, 260).setDepth(20);

    this.messageText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 - 170,
      message,
      { fontSize: '20px', color: '#000', wordWrap: { width: 500 }, align: 'center' }
    ).setOrigin(0.5).setDepth(21);

    if (this.dialogueSounds[this.dialogueIndex]) {
        this.dialogueSounds[this.dialogueIndex].play();
    }

    this.dialogueIndex++;

    if (this.dialogueIndex < this.dialogues.length) {
      this.time.delayedCall(3000, () => this.showDialogues());
    } else {
      // After dialogues, show quiz modal
      this.time.delayedCall(5000, () => this.showQuizModal());
    }
  }

  showQuizModal() {
    this.messageBox.destroy();
    this.messageText.destroy()
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    // Modal background
    this.modalBg = this.add.image(centerX, centerY, 'modal')
      .setOrigin(0.5)
      .setDisplaySize(700, 530) // +30 height/width
      .setDepth(10);

    // Talker
    this.talker.setPosition(centerX - 230, centerY - 40);
    this.talker.setScale(0.4);
    this.talker.setDepth(11);

    // Quiz text
    this.quizText = this.add.text(centerX+20, centerY - 100,
      "An earthquake has occurred!\nWhat should you do?",
      { fontSize: '23px', color: '#000', wordWrap: { width: 480 }, align: 'center' }
    ).setOrigin(0.5).setDepth(12);
    this.quiz.play()

    const optionTexts = [
      "Hide under tables and benches",
      "Try to leave the school premises"
    ];
    this.opTimer = this.time.delayedCall(3000, () => {
    this.op.play();
});


    this.options = [];
    optionTexts.forEach((text, i) => {
      let option = this.add.text(centerX+30, centerY - 40 + i * 60, text, {
        fontSize: '20px',
        color: '#000',
        backgroundColor: '#f0f0f0',
        padding: { x: 12, y: 6 }
      }).setOrigin(0.5).setInteractive().setDepth(12);

      option.on('pointerdown', () =>{ this.sound.stopAll();this.showConsequence(i + 1)});
      this.options.push(option);
    });

    // Go back to start screen
    this.goBack = this.add.text(centerX, centerY + 180, "Go Back",
      { fontSize: '24px', backgroundColor: '#000', color: '#fff', padding: { x: 10, y: 5 } }
    ).setOrigin(0.5).setInteractive().setDepth(12);

    this.goBack.on('pointerdown', () => {
      this.sound.stopAll()
      if (this.opTimer) {
        this.opTimer.remove(false);
        this.opTimer = null;
    }
      this.resetToStartScreen();
    });
  }

  showConsequence(choice) {
    // Destroy previous quiz modal
    if (this.modalBg) this.modalBg.destroy();
    if (this.quizText) this.quizText.destroy();
    if (this.options) this.options.forEach(opt => opt.destroy());
    if (this.goBack) this.goBack.destroy();

    if (this.opTimer) {
        this.opTimer.remove(false);
        this.opTimer = null;
    }


    let message = "";
    let consequenceBg;

    if (choice === 1) {
      message = "Hiding under tables and benches will protect you from rubble if the ceiling falls. This is the safest choice.";
      consequenceBg = this.add.image(this.scale.width / 2, this.scale.height / 2, 'hiding');
      this.c1.play()
    } else {
      message = "Trying to leave the school premises during an earthquake is extremely dangerous and increases risk of injury or death.";
      consequenceBg = this.add.image(this.scale.width / 2, this.scale.height / 2, 'running');
      this.c2.play()
    }

    consequenceBg.setOrigin(0.5).setDisplaySize(this.scale.width, this.scale.height).setDepth(5);
    this.talker.setPosition(440,280).setDepth(23)

    // Modal for consequence
    this.messageBox = this.add.image(
      this.scale.width / 2,
      this.scale.height / 2 - 150,
      'modal'
    ).setOrigin(0.5).setDisplaySize(660, 260).setDepth(20);

    this.messageText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 - 170,
      message,
      { fontSize: '18px', color: '#000', wordWrap: { width: 480 }, align: 'center' }
    ).setOrigin(0.5).setDepth(21);

    // Go back → to quiz modal
    this.goBack = this.add.text(this.scale.width / 2, this.scale.height / 2 - 30, "Go Back",
      { fontSize: '24px', backgroundColor: '#000', color: '#fff', padding: { x: 10, y: 5 } }
    ).setOrigin(0.5).setInteractive().setDepth(12);

    this.goBack.on('pointerdown', () => {
      // destroy consequence modal
      this.sound.stopAll()
      this.sound.stopByKey("op")
      
      this.messageBox.destroy();
      this.messageText.destroy();
      this.goBack.destroy();
      consequenceBg.destroy();
      this.showQuizModal();
    });
  }

  resetToStartScreen() {
    // Remove all modals and options
    this.sound.stopAll()
    if (this.modalBg) this.modalBg.destroy();
    if (this.quizText) this.quizText.destroy();
    if (this.options) this.options.forEach(opt => opt.destroy());
    if (this.goBack) this.goBack.destroy();
    if (this.messageBox) this.messageBox.destroy();
    if (this.messageText) this.messageText.destroy();
    if (this.earthquake) this.earthquake.destroy();
    

    // Reset talker
    this.talker.setVisible(false);

    // Add Start Quiz button again
    this.startButtonBg = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      200,
      60,
      0x2563eb
    ).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.startButtonText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2,
      "Start Module",
      { fontSize: "22px", color: "#fff", fontFamily: "Arial" }
    ).setOrigin(0.5);

    this.startButtonBg.on("pointerdown", () => {
      this.startButtonBg.destroy();
      this.startButtonText.destroy();
      this.startQuiz();
    });
  }

  update() {}
}

const config = {
  type: Phaser.WEBGL,
  width: sizes.width,
  height: sizes.height,
  canvas: gameCanvas,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: speedDown },
      debug: true
    }
  },
  scene: [GameScene],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

const game = new Phaser.Game(config);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
