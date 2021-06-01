use std::fmt;
use std::io::Write;
use std::rc::Rc;

use deno_core::error::anyhow;
use deno_core::error::AnyError;
use deno_core::futures::StreamExt;
use deno_core::resolve_url_or_path;
use deno_core::JsRuntime;
use deno_core::RuntimeOptions;
use deno_core::Snapshot;
use termcolor::Ansi;
use termcolor::Color::Red;
use termcolor::ColorSpec;
use termcolor::WriteColor;

static CTSR_SNAPSHOT: &[u8] =
  include_bytes!(concat!(env!("OUT_DIR"), "/CTSR_SNAPSHOT.bin"));

#[tokio::main(flavor = "current_thread")]
async fn main() {
  unwrap_or_exit(run().await)
}

async fn run() -> Result<(), AnyError> {
  let args = std::env::args().collect::<Vec<_>>();
  let url = args.get(1).ok_or_else(|| {
    anyhow!("missing specifier in first command line argument")
  })?;
  let specifier = resolve_url_or_path(url)?;

  let options = RuntimeOptions {
    startup_snapshot: Some(Snapshot::Static(CTSR_SNAPSHOT)),
    module_loader: Some(Rc::new(deno_core::FsModuleLoader)),
    extensions: vec![
      deno_webidl::init(),
      deno_console::init(),
      deno_url::init(),
      deno_web::init(),
      deno_webgpu::init(true),
    ],
    ..Default::default()
  };
  let mut isolate = JsRuntime::new(options);
  isolate.execute("<anon>", "globalThis.bootstrap()")?;

  let mod_id = isolate.load_module(&specifier, None).await?;
  let mut rx = isolate.mod_evaluate(mod_id);

  let rx = tokio::spawn(async move {
    loop {
      match rx.next().await {
        Some(Ok(())) => (),
        Some(err @ Err(_)) => return err,
        None => return Ok(()),
      }
    }
  });

  isolate.run_event_loop(false).await?;
  rx.await.unwrap()?;

  Ok(())
}

fn unwrap_or_exit<T>(result: Result<T, AnyError>) -> T {
  match result {
    Ok(value) => value,
    Err(error) => {
      eprintln!("{}: {:?}", red_bold("error"), error);
      std::process::exit(1);
    }
  }
}

fn style<S: AsRef<str>>(s: S, colorspec: ColorSpec) -> impl fmt::Display {
  let mut v = Vec::new();
  let mut ansi_writer = Ansi::new(&mut v);
  ansi_writer.set_color(&colorspec).unwrap();
  ansi_writer.write_all(s.as_ref().as_bytes()).unwrap();
  ansi_writer.reset().unwrap();
  String::from_utf8_lossy(&v).into_owned()
}

fn red_bold<S: AsRef<str>>(s: S) -> impl fmt::Display {
  let mut style_spec = ColorSpec::new();
  style_spec.set_fg(Some(Red)).set_bold(true);
  style(s, style_spec)
}