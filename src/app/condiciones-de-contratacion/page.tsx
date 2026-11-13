import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, OwnerData, legalEmail } from "@/components/legal-page";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Condiciones de contratación | Advanthor",
  description: "Condiciones generales de contratación de los servicios de creación web, mantenimiento web, SEO y ciberseguridad de Advanthor.",
  path: "/condiciones-de-contratacion",
});

export default function CondicionesPage() {
  return (
    <LegalPage
      title="Condiciones de contratación"
      intro="Estas condiciones generales regulan la contratación de los servicios de Advanthor, de acuerdo con la Ley 34/2002 (LSSI), la Ley 7/1998 sobre condiciones generales de la contratación y, cuando el cliente es consumidor, el Real Decreto Legislativo 1/2007 (Ley General para la Defensa de los Consumidores y Usuarios). Cada encargo se concreta en una propuesta o presupuesto aceptado por escrito, que prevalece sobre estas condiciones en lo que regule de forma específica."
    >
      <h2>1. Prestador del servicio</h2>
      <OwnerData />

      <h2>2. Servicios</h2>
      <p>Advanthor presta los siguientes servicios, con el alcance que se describa en cada propuesta:</p>
      <ul>
        <li><strong>Creación web</strong>: diseño y desarrollo de webs corporativas, tiendas online y landing pages.</li>
        <li><strong>Mantenimiento web</strong>: actualizaciones, copias de seguridad, monitorización, corrección de errores y soporte, según el plan contratado.</li>
        <li><strong>SEO y posicionamiento</strong>: auditorías, SEO técnico, on-page y local, y trabajo continuo de optimización.</li>
        <li><strong>Ciberseguridad</strong>: medidas preventivas, auditorías e intervención ante incidentes en la web del cliente.</li>
      </ul>
      <p>
        Las auditorías y los análisis de vulnerabilidades se realizan únicamente sobre sistemas del cliente o sobre los
        que este tenga autorización, con su autorización expresa por escrito y dentro del alcance acordado.
      </p>

      <h2>3. Proceso de contratación</h2>
      <ol>
        <li>El cliente solicita información o presupuesto por el formulario, WhatsApp, teléfono o correo.</li>
        <li>Advanthor envía una propuesta por escrito con el alcance, el precio, los plazos y las condiciones particulares.</li>
        <li>
          El contrato se perfecciona cuando el cliente acepta la propuesta por escrito (por ejemplo, por correo electrónico)
          y, si así se indica, abona el anticipo. Advanthor confirmará la aceptación y conservará una copia del documento
          aceptado, que el cliente puede solicitar en cualquier momento.
        </li>
      </ol>
      <p>El contrato se formaliza en castellano.</p>

      <h2>4. Presupuestos, precios y pago</h2>
      <ul>
        <li>Los presupuestos son válidos durante 30 días naturales desde su envío, salvo que indiquen otro plazo.</li>
        <li>
          Los precios se expresan en euros. Salvo que se indique lo contrario, no incluyen el IVA ni otros impuestos
          aplicables, que se añadirán en la factura al tipo vigente. En las ofertas dirigidas a consumidores se indicará
          siempre el precio final con impuestos.
        </li>
        <li>
          <strong>Proyectos</strong> (creación web, auditorías, proyectos SEO): 50 % al aceptar la propuesta y 50 % a la
          entrega, salvo que la propuesta fije otro calendario de pagos.
        </li>
        <li><strong>Servicios mensuales</strong> (mantenimiento y SEO mensual): cuota mensual facturada por adelantado al inicio de cada mes.</li>
        <li>
          Los costes de terceros que necesite el proyecto (dominio, alojamiento, licencias, plugins o temas de pago) no están
          incluidos salvo que la propuesta lo diga, y se contratan a nombre del cliente siempre que sea posible.
        </li>
        <li>
          El impago de una factura en el plazo indicado permite a Advanthor suspender el servicio tras avisar al cliente, sin
          perjuicio de reclamar las cantidades debidas.
        </li>
      </ul>

      <h2>5. Plazos, entregas y revisiones</h2>
      <p>
        Los plazos de cada proyecto se fijan en la propuesta y empiezan a contar cuando Advanthor recibe el anticipo y los
        contenidos y accesos que debe aportar el cliente. Los retrasos en esa entrega o en las validaciones del cliente
        amplían el plazo en el mismo tiempo.
      </p>
      <p>
        Salvo que la propuesta diga otra cosa, los proyectos de creación web incluyen dos rondas de revisiones sobre el
        diseño acordado. Los cambios que amplíen el alcance inicial se presupuestan aparte. El proyecto se considera
        entregado cuando se publica o se pone a disposición del cliente; si este no comunica incidencias en los 15 días
        siguientes, se entiende aceptado, sin perjuicio de la corrección de errores atribuibles a Advanthor.
      </p>

      <h2>6. Servicios recurrentes: mantenimiento y SEO mensual</h2>
      <ul>
        <li>Se contratan por meses y se renuevan automáticamente cada mes, sin permanencia mínima salvo que la propuesta indique otra cosa.</li>
        <li>El cliente puede darse de baja en cualquier momento avisando con 15 días de antelación al siguiente periodo de facturación. La baja surte efecto al final del mes en curso.</li>
        <li>Los cambios de plan se aplican desde el periodo de facturación siguiente.</li>
        <li>Las horas o tareas incluidas en cada plan que no se usen en un mes no se acumulan para meses posteriores.</li>
        <li>Advanthor puede actualizar las cuotas avisando con al menos 30 días de antelación; el cliente que no esté de acuerdo puede darse de baja sin coste antes de que se apliquen.</li>
      </ul>

      <h2>7. Obligaciones del cliente</h2>
      <ul>
        <li>Facilitar a tiempo los contenidos, la información y los accesos necesarios para prestar el servicio.</li>
        <li>Garantizar que tiene los derechos sobre los textos, imágenes, logotipos y demás materiales que aporta, y que su uso no vulnera derechos de terceros.</li>
        <li>Autorizar por escrito las auditorías y pruebas de seguridad sobre sus sistemas.</li>
        <li>Revisar y validar las entregas en los plazos acordados.</li>
        <li>Cumplir la normativa aplicable a su propia web y actividad, incluidas sus obligaciones como responsable del tratamiento de los datos de sus usuarios.</li>
      </ul>

      <h2>8. Propiedad intelectual y entrega de accesos</h2>
      <p>
        Una vez pagado el proyecto en su totalidad, el cliente adquiere los derechos de uso y explotación sobre el diseño y
        los contenidos creados específicamente para él. Los componentes de terceros (gestores de contenidos, temas,
        plugins, tipografías o librerías) se rigen por sus propias licencias. Advanthor conserva sus herramientas,
        métodos y desarrollos genéricos reutilizables, y podrá citar el proyecto en su portafolio salvo que el cliente se
        oponga.
      </p>
      <p>
        Al terminar el proyecto, o al finalizar un servicio recurrente, Advanthor entrega al cliente los accesos de
        administración de su web, dominio y alojamiento que haya gestionado por su cuenta.
      </p>

      <h2>9. Responsabilidad</h2>
      <p>
        Advanthor presta sus servicios con la diligencia profesional exigible y aplicando buenas prácticas. Sus
        obligaciones son de medios y no de resultado. En particular, no se garantizan posiciones concretas en buscadores,
        que dependen de factores externos como los algoritmos de cada buscador o la competencia, ni la imposibilidad
        absoluta de incidentes de seguridad, aunque se apliquen medidas para reducir su riesgo y su impacto.
      </p>
      <p>
        Advanthor no responde de los daños causados por servicios de terceros (alojamiento, dominio, plugins,
        plataformas de pago o de correo), por cambios hechos por el cliente o por terceros ajenos a Advanthor, ni de
        los derivados de un uso indebido de la web. Salvo en caso de dolo o culpa grave, la responsabilidad de Advanthor
        frente a clientes empresarios o profesionales se limita al importe pagado por el servicio afectado en los 12
        meses anteriores. Esta limitación no se aplica a los consumidores en lo que la ley no permita.
      </p>

      <h2>10. Confidencialidad y protección de datos</h2>
      <p>
        Ambas partes mantendrán la confidencialidad de la información que reciban de la otra con motivo del servicio.
        Cuando el servicio implique acceder a datos personales de los que el cliente es responsable, las partes firmarán
        un contrato de encargo del tratamiento conforme al artículo 28 del RGPD. Los datos del cliente se tratan como se
        explica en la <Link href="/politica-de-privacidad">política de privacidad</Link>.
      </p>

      <h2>11. Derecho de desistimiento (solo consumidores)</h2>
      <p>
        Si contratas como consumidor y a distancia, puedes desistir del contrato en un plazo de 14 días naturales desde su
        celebración, sin indicar el motivo ni coste alguno, comunicándolo por escrito a {legalEmail()}. Te devolveremos
        los pagos recibidos en un plazo máximo de 14 días por el mismo medio de pago.
      </p>
      <p>
        Si nos pides expresamente que empecemos a prestar el servicio durante el plazo de desistimiento, deberás abonar la
        parte proporcional del servicio ya prestado. Perderás el derecho de desistimiento una vez el servicio se haya
        ejecutado por completo, siempre que la ejecución haya comenzado con tu consentimiento expreso y tu reconocimiento
        de que conocías esa consecuencia (artículos 102 a 108 del Real Decreto Legislativo 1/2007). Los clientes
        empresarios o profesionales no tienen derecho de desistimiento.
      </p>

      <h2>12. Reclamaciones</h2>
      <p>
        Puedes enviarnos cualquier queja o reclamación a {legalEmail()} y te responderemos en el menor plazo posible y, en
        todo caso, en un máximo de un mes. Si eres consumidor, también puedes acudir al Sistema Arbitral de Consumo o a
        los servicios de consumo de tu comunidad autónoma.
      </p>

      <h2>13. Modificación de estas condiciones</h2>
      <p>
        Advanthor puede modificar estas condiciones. Los cambios no afectan a los encargos ya aceptados, que se rigen por
        las condiciones vigentes en el momento de su aceptación.
      </p>

      <h2>14. Legislación aplicable y jurisdicción</h2>
      <p>
        Estas condiciones se rigen por la legislación española. Si el cliente es consumidor, serán competentes los juzgados
        y tribunales de su domicilio. Si es empresario o profesional, las partes se someten a los juzgados y tribunales del
        domicilio de Advanthor.
      </p>
    </LegalPage>
  );
}
